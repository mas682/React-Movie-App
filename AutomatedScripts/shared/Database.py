import psycopg2
from psycopg2.extras import DictCursor
from psycopg2 import OperationalError
import time

class Database:
    def __init__(self, connectionParams, applicationName, maxConnectionRetryAttempts = 0, connectionAttemptDelay = 10):
        self._host = connectionParams["host"]
        self._port = connectionParams["port"]
        self._database = connectionParams["database"]
        self._user = connectionParams["user"]
        self._password = connectionParams["password"]
        self._connection = None
        self._cur = None
        self._application = applicationName
        # 0 retry attemps by default
        self._maxConnectionRetryAttempts = maxConnectionRetryAttempts if maxConnectionRetryAttempts is not None else 0
        # 10 second delay on retry by default
        self._connectionAttemptDelay = connectionAttemptDelay if connectionAttemptDelay is not None else 10
        self._connectionRetryAttempts = -1


    def connect(self):
        try:
            self._connectionRetryAttempts = self._connectionRetryAttempts + 1
            self._connection=psycopg2.connect(host=self._host,port=self._port,database=self._database,user=self._user,password=self._password, application_name=self._application)
            # automatically commit changes
            self._connection.autocommit = True
            self._cur = self._connection.cursor(cursor_factory=DictCursor)
        except OperationalError as err:
            if(self._connectionRetryAttempts < self._maxConnectionRetryAttempts):
                print("Connection to database failed.  Trying to connect again in " + str(self._connectionAttemptDelay) + " seconds")
                time.sleep(self._connectionAttemptDelay)
                self.connect()
            else:
                if self._connection is not None:
                    self._connection.close()
                    self._connection = None
                self._cur = None
                raise err
        except:
            if self._connection is not None:
                self._connection.close()
                self._connection = None
            self._cur = None
            raise

        return {"connection": self._connection, "cur": self._cur}

    def disconnect(self):
        try:
            # close the communication with the PostgreSQL
            if(self._cur is not None):
                self._cur.close()
        except:
            # here as I need to still hit the finally block
            raise
        finally:
            if self._connection is not None:
                self._connection.close()

        self._connection = None
        self._cur = None


    # function to see if a job with a given id is enabled
    def getJobEnabled(self, id, logger, extras):
        enabled = False
        id = str(id)
        sql = """
            SELECT * from private."ScheduledJobs"
	        WHERE id=""" + id + """ and "Enabled" = True;
        """
        self.executeQuery(sql, "select statement that caused the error:", logger, extras)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = True

        return enabled

    # this will update the databse to create a record of a running cron job, specifically for cron jobs 
    # that run inside of containers 
    def startContainerCronJob(self, id, stepId, server, logger, extras):
        startTime = None
        jobId = -1
        id = str(id)
        stepId = str(stepId)

        sql = """
            UPDATE private."ScheduledJobs"
               SET
                     "lastRun"=CURRENT_TIMESTAMP
               WHERE id=""" + id + """
               RETURNING "lastRun";
        """
        self.executeQuery(sql, "update statement that caused the error:", logger, extras)
        result = self._cur.fetchall()
        if(len(result) > 0):
            startTime = str(result[0][0])
            # if at this point, job marked as active
            sql = ("""
                INSERT INTO private."JobDetails"(
                "jobId", "stepId", "startTime", "lastActive", state, "server", "updatedAt")
                    VALUES (""" + id + """,""" + stepId + """,'""" + startTime +
                    """','""" + startTime + """','Starting Container','""" + 
                    server + """', CURRENT_TIMESTAMP)
                    RETURNING "id";
                    """)
            self.executeQuery(sql, "insert statement that caused the error:", logger, extras)
            result = self._cur.fetchall()
            if(len(result) > 0):
                jobId = result[0][0]

        return {"jobDetailsId": jobId}

    # function to use in place of startJob in ScriptController when the job is a 
    # cron job ran via container
    # the job will have already been marked as started so just need to get if enabled 
    # and update log to say the job is actually running now
    def updateContainerCronJob(self, id, stepId, server, jobDetailsId, logger, extras):
        enabled = False
        startTime = None
        id = str(id)
        stepId = str(stepId)
        jobDetailsId = str(jobDetailsId)
        scriptPath = None
        agruments = None

        sql = """
            SELECT 
                case when s."Enabled" and js."enabled"
                    then true
                else
                    False
                end as "Enabled",
                js."scriptPath",
                js."arguments",
                js."logArguments"
            from private."ScheduledJobs" s
            left join private."JobSteps" js on js."id" = """ + stepId + """
            and js."jobId" = """ + id + """
            where s."id" = """ + id + """
        """
        self.executeQuery(sql, "select statement that caused the error:", logger, extras)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = result[0][0]
            scriptPath = result[0][1]
            arguments = result[0][2]
            logArguments = result[0][3]
            # if at this point, job already marked as active
            sql = ("""
                UPDATE private."JobDetails"
                    SET
                            "lastActive"=CURRENT_TIMESTAMP,
                            "state"='Running'
                    WHERE id=""" + jobDetailsId + """;
            """)
            self.executeQuery(sql, "update statement that caused the error:", logger, extras)

        return {"enabled": enabled, "jobDetailsId": int(jobDetailsId), "scriptPath": scriptPath, "arguments": arguments, "logArguments": logArguments}


    # this will update the database to create a record of a running job
    def startJob(self, id, stepId, server, engine, logger, extras):
        enabled = False
        startTime = None
        jobId = -1
        id = str(id)
        stepId = str(stepId)
        engine = str(engine)
        scriptPath = None
        agruments = None

        sql = """
            UPDATE private."ScheduledJobs"
               SET
                     "lastRun"=CURRENT_TIMESTAMP
               WHERE id=""" + id + """;

            SELECT 
                case when s."Enabled" and js."enabled"
                    then true
                else
                    False
                end as "Enabled",
                js."scriptPath",
                js."arguments",
                js."logArguments",
	            "lastRun"
            from private."ScheduledJobs" s
            left join private."JobSteps" js on js."id" = """ + stepId + """
            and js."jobId" = """ + id + """
            where s."id" = """ + id + """
        """
        self.executeQuery(sql, "sql statement that caused the error:", logger, extras)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = result[0][0]
            scriptPath = result[0][1]
            arguments = result[0][2]
            logArguments = result[0][3]
            startTime = str(result[0][4])
            # if at this point, job marked as active
            sql = ("""
                INSERT INTO private."JobDetails"(
                "jobId", "stepId", "startTime", "lastActive", state, "engine", "server", "updatedAt")
                    VALUES (""" + id + """,""" + stepId + """,'""" + startTime +
                    """','""" + startTime + """','Running',""" + engine + """,'""" + 
                    server + """', CURRENT_TIMESTAMP)
                    RETURNING "id";
                    """)
            self.executeQuery(sql, "insert statement that caused the error:", logger, extras)
            result = self._cur.fetchall()
            if(len(result) > 0):
                jobId = result[0][0]

        return {"enabled": enabled, "jobDetailsId": jobId, "scriptPath": scriptPath, "arguments": arguments, "logArguments": logArguments}


    # this function updates the database to indicate this job is still active
    # and this returns whether the database still has this job enabled
    def updateRunningJob(self, jobDetailsId, logger, extras):
        jobDetailsId = str(jobDetailsId)
        script = """
            UPDATE private."JobDetails"
               SET
                     "lastActive"=CURRENT_TIMESTAMP
               WHERE id=""" + jobDetailsId + """;
        """
        self.executeQuery(script, "update statement that caused the error:", logger, extras)


    # function to update a database to indicate a job finsihed
    # state is the state of the job finishing...successful, failed, etc.
    def stopJob(self, jobDetailsId, state, logger, extras):
        jobDetailsId = str(jobDetailsId)

        script = """
            UPDATE private."JobDetails"
                   SET
    	                 "lastActive"=CURRENT_TIMESTAMP,
                         "finished"=CURRENT_TIMESTAMP,
                         "state"='""" + state + """'
                   WHERE id=""" + jobDetailsId + """;
        """
        self.executeQuery(script, "update statement that caused the error:", logger, extras)

    # function to execute some sql
    # catches any errors and prints out the sql that caused the error to the log file
    # sql is the sql statement to run
    # error message is the message to prefix the sql statement with in the log file
    def executeQuery(self, sql, errorMessage, logger, extras):
        try:
            self._cur.execute(sql)
        except:
            print("The following sql caused an error:")
            print(sql)
            logger.info(errorMessage + "\n" + sql, extra=extras)
            raise

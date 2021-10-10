import psycopg2
from psycopg2.extras import DictCursor

class Database:
    def __init__(self, connectionParams, applicationName):
        self._host = connectionParams["host"]
        self._port = connectionParams["port"]
        self._database = connectionParams["database"]
        self._user = connectionParams["user"]
        self._password = connectionParams["password"]
        self._connection = None
        self._cur = None
        self._application = applicationName


    def connect(self):
        try:
            self._connection=psycopg2.connect(host=self._host,port=self._port,database=self._database,user=self._user,password=self._password, application_name=self._application)
            # automatically commit changes
            self._connection.autocommit = True
            self._cur = self._connection.cursor(cursor_factory=DictCursor)
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
    def getJobEnabled(self, id):
        enabled = False
        id = str(id)
        self._cur.execute("""
            SELECT * from private."ScheduledJobs"
	        WHERE id=""" + id + """ and "Enabled" = True;
        """)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = True

        return enabled

    # this will update the databse to create a record of a running cron job, specifically for cron jobs 
    # that run inside of containers 
    def startContainerCronJob(self, id, stepId, server):
        startTime = None
        jobId = -1
        id = str(id)
        stepId = str(stepId)

        self._cur.execute("""
            UPDATE private."ScheduledJobs"
               SET
                     "lastRun"=CURRENT_TIMESTAMP
               WHERE id=""" + id + """
               RETURNING "lastRun";
        """)
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
            print(sql)
            self._cur.execute(sql)
            result = self._cur.fetchall()
            if(len(result) > 0):
                jobId = result[0][0]

        return {"jobDetailsId": jobId}

    # function to use in place of startJob in ScriptController when the job is a 
    # cron job ran via container
    # the job will have already been marked as started so just need to get if enabled 
    # and update log to say the job is actually running now
    def updateContainerCronJob(self, id, stepId, server, jobDetailsId):
        enabled = False
        startTime = None
        id = str(id)
        stepId = str(stepId)
        jobDetailsId = str(jobDetailsId)
        scriptPath = None
        agruments = None

        self._cur.execute("""
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
        """)
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
            self._cur.execute(sql)

        return {"enabled": enabled, "jobDetailsId": int(jobDetailsId), "scriptPath": scriptPath, "arguments": arguments, "logArguments": logArguments}


    # this will update the database to create a record of a running job
    def startJob(self, id, stepId, server, engine):
        enabled = False
        startTime = None
        jobId = -1
        id = str(id)
        stepId = str(stepId)
        engine = str(engine)
        scriptPath = None
        agruments = None

        self._cur.execute("""
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
        """)
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
            print(sql)
            self._cur.execute(sql)
            result = self._cur.fetchall()
            if(len(result) > 0):
                jobId = result[0][0]

        return {"enabled": enabled, "jobDetailsId": jobId, "scriptPath": scriptPath, "arguments": arguments, "logArguments": logArguments}


    # this function updates the database to indicate this job is still active
    # and this returns whether the database still has this job enabled
    def updateRunningJob(self, jobDetailsId):
        jobDetailsId = str(jobDetailsId)
        self._cur.execute("""
            UPDATE private."JobDetails"
               SET
                     "lastActive"=CURRENT_TIMESTAMP
               WHERE id=""" + jobDetailsId + """;
        """)


    # function to update a database to indicate a job finsihed
    # state is the state of the job finishing...successful, failed, etc.
    def stopJob(self, jobDetailsId, state):
        jobDetailsId = str(jobDetailsId)

        self._cur.execute("""
            UPDATE private."JobDetails"
                   SET
    	                 "lastActive"=CURRENT_TIMESTAMP,
                         "finished"=CURRENT_TIMESTAMP,
                         "state"='""" + state + """'
                   WHERE id=""" + jobDetailsId + """;
        """)

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
            SELECT * from public."ScheduledJobs"
	        WHERE id=""" + id + """ and "Enabled" = True;
        """)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = True

        return enabled

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
            UPDATE public."ScheduledJobs"
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
	            "lastRun"
            from public."ScheduledJobs" s
            left join public."JobSteps" js on js."id" = """ + stepId + """
            and js."jobId" = """ + id + """
            where s."id" = """ + id + """
        """)
        result = self._cur.fetchall()
        if(len(result) > 0):
            enabled = result[0][0]
            scriptPath = result[0][1]
            arguments = result[0][2]
            startTime = str(result[0][3])
            # if at this point, job marked as active
            self._cur.execute("""
                INSERT INTO public."JobDetails"(
                "jobId", "stepId", "startTime", "lastActive", state, "engine", "server", "updatedAt")
                    VALUES (""" + id + """,""" + stepId + """,'""" + startTime +
                    """','""" + startTime + """','Running',""" + engine + """,'""" + 
                    server + """', CURRENT_TIMESTAMP)
                    RETURNING "id";
                    """)
            result = self._cur.fetchall()
            if(len(result) > 0):
                jobId = result[0][0]

        return {"enabled": enabled, "jobDetailsId": jobId, "scriptPath": scriptPath, "arguments": arguments}


    # this function updates the database to indicate this job is still active
    # and this returns whether the database still has this job enabled
    def updateRunningJob(self, jobDetailsId):
        jobDetailsId = str(jobDetailsId)
        self._cur.execute("""
            UPDATE public."JobDetails"
               SET
                     "lastActive"=CURRENT_TIMESTAMP
               WHERE id=""" + jobDetailsId + """;
        """)


    # function to update a database to indicate a job finsihed
    # state is the state of the job finishing...successful, failed, etc.
    def stopJob(self, jobDetailsId, state):
        jobDetailsId = str(jobDetailsId)

        self._cur.execute("""
            UPDATE public."JobDetails"
                   SET
    	                 "lastActive"=CURRENT_TIMESTAMP,
                         "finished"=CURRENT_TIMESTAMP,
                         "state"='""" + state + """'
                   WHERE id=""" + jobDetailsId + """;
        """)

import psycopg2
from psycopg2.extras import DictCursor

class Database:
    def __init__(self, connectionParams):
        self._host = connectionParams["host"]
        self._port = connectionParams["port"]
        self._database = connectionParams["database"]
        self._user = connectionParams["user"]
        self._password = connectionParams["password"]
        self._connection = None
        self._cur = None


    def connect(self):
        failedOutput = []
        successfulOutput = []
        failedOutput.append("Connecting to database\n")
        try:
            print(self._host)
            self._connection=psycopg2.connect(host=self._host,port=self._port,database=self._database,user=self._user,password=self._password)
            # automatically commit changes
            self._connection.autocommit = True
            self._cur = self._connection.cursor(cursor_factory=DictCursor)
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("Failed to connect to the database with the following error:\n")
            failedOutput.append(str(error))
            if self._connection is not None:
                self._connection.close()
                failedOutput.append('Database connection closed\n')
                self._connection = None
            self._cur = None

        return {"connection": self._connection, "cur": self._cur, "failedOutput": failedOutput}

    def disconnect(self):
        failedOutput = []
        failedOutput.append("\nDisconnectiong from database\n")
        try:
            # close the communication with the PostgreSQL
            self._cur.close()
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred closing the cursor to the database: \n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        finally:
            if self._connection is not None:
                self._connection.close()
                failedOutput.append('Database connection closed\n')
        self._connection = None
        self._cur = None
        return {"failedOutput": failedOutput}


    # function to see if a job with a given id is enabled
    def getJobEnabled(self, id):
        failedOutput = []
        enabled = False
        id = str(id)
        try:
            self._cur.execute("""
                SELECT * from public."ScheduledJobs"
	            WHERE id=""" + id + """ and "Enabled" = True;
            """)
            result = self._cur.fetchall()
            if(len(result) > 0):
                enabled = True
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred trying to see if the job with id(" + id  + ") is enabled\n")
            failedOutput.append(str(error))

        return {"failedOutput": failedOutput, "enabled": enabled}

    # this will update the database to create a record of a running job
    def startJob(self, id):
        failedOutput = []
        enabled = False
        startTime = None
        jobId = -1
        id = str(id)
        try:
            self._cur.execute("""
                UPDATE public."ScheduledJobs"
                   SET
                         "lastRun"=CURRENT_TIMESTAMP,
    	                 "lastActive"=CURRENT_TIMESTAMP,
                         "lastFinished"=null
                   WHERE id=""" + id + """ and "Enabled" = True
                   Returning "Enabled","lastActive";
            """)
            result = self._cur.fetchall()
            if(len(result) > 0):
                if(result[0][0]):
                    enabled = True
                    startTime = str(result[0][1])
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred trying mark the job with the id(" + id  + ") as started\n")
            failedOutput.append(str(error))

        # if at this point, job marked as active
        if(enabled):
            try:
                self._cur.execute("""
                    INSERT INTO public."JobDetails"(
	                   "jobId", "startTime", "lastActive", state, "updatedAt")
	                    VALUES (""" + id + """,'""" + startTime + """','""" + startTime + """','Running', CURRENT_TIMESTAMP)
                        RETURNING "id";
                        """)
                result = self._cur.fetchall()
                if(len(result) > 0):
                    jobId = result[0][0]
            except (Exception, psycopg2.DatabaseError) as error:
                failedOutput.append("An error occurred trying to insert the job details for the job with id(" + id  + ") when starting the job\n")
                failedOutput.append(str(error))

        return {"failedOutput": failedOutput, "enabled": enabled, "jobDetailsId": jobId}


    # this function updates the database to indicate this job is still active
    # and this returns whether the database still has this job enabled
    def updateRunningJob(self, id, jobDetailsId):
        failedOutput = []
        enabled = False
        lastActive = None
        id = str(id)
        jobDetailsId = str(jobDetailsId)
        try:
            self._cur.execute("""
                UPDATE public."ScheduledJobs"
	               SET
		                 "lastActive"=CURRENT_TIMESTAMP
	               WHERE id=""" + id + """
	               Returning "Enabled", "lastActive";
            """)
            result = self._cur.fetchall()
            if(len(result) > 0):
                if(result[0][0]):
                    enabled = True
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred trying to update the status of the job with id(" + id  + ")\n")
            failedOutput.append(str(error))

        # if last active is not none, could successfully update database
        if(lastActive is not None):
            try:
                self._cur.execute("""
                    UPDATE public."JobDetails"
                       SET
        	                 "lastActive"=CURRENT_TIMESTAMP
                       WHERE id=""" + jobDetailsId + """;
                """)
            except (Exception, psycopg2.DatabaseError) as error:
                failedOutput.append("An error occurred trying to update the job details of the job with job detials id(" + jobDetailsId  + ")\n")
                failedOutput.append(str(error))

        return {"failedOutput": failedOutput, "enabled": enabled}


    # function to update a database to indicate a job finsihed
    # state is the state of the job finishing...successful, failed, etc.
    def stopJob(self, id, jobDetailsId, state):
        failedOutput = []
        endTime = None
        id = str(id)
        jobDetailsId = str(jobDetailsId)
        try:
            self._cur.execute("""
                UPDATE public."ScheduledJobs"
                   SET
    	                 "lastActive"=CURRENT_TIMESTAMP,
                         "lastFinished"=CURRENT_TIMESTAMP
                   WHERE id=""" + id + """
                   Returning "lastFinished";
            """)
            result = self._cur.fetchall()
            if(len(result) > 0):
                endTime = str(result[0][0])
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred trying mark the job with the job id(" + id  + ") as finished\n")
            failedOutput.append(str(error))

        if(endTime is not None):
            try:
                self._cur.execute("""
                    UPDATE public."JobDetails"
                               SET
                	                 "lastActive"='""" + endTime + """',
                                     "finished"='""" + endTime + """',
                                     "state"='""" + state + """'
                               WHERE id=""" + jobDetailsId + """;
                """)
            except (Exception, psycopg2.DatabaseError) as error:
                failedOutput.append("An error occurred trying mark the job with the job details id(" + jobDetailsId  + ") as finished\n")
                failedOutput.append(str(error))

        return {"failedOutput":failedOutput}

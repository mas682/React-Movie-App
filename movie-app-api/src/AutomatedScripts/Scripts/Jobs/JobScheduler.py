# 9/11/2021
# Matt Stropkey
# This script is used to add jobs to the job queue
# command to run(will have to change jobId and stepId):
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.JobScheduler -jobId 3 -stepId 4

def main(logger, db, extras, jobId, jobDetailsId, arguments):
    script = """call private."UpdateJobQueue"() """
    print("Executing stored procedure: \n" + script)
    db._cur.execute(script)
    return "Finished Successfully"

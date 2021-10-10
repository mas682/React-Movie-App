# 8/31/2021
# Matt Stropkey
# This script is used to run the jobs in the queue.  It will first check to see how many 
# job containers are running.  If not at the maximum number of containers to run, see if 
# there is work to do and start a eninge container
# command to run(will have to change jobId and stepId):
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.EngineControl -jobId 1 -stepId 3

import docker
import os

from AutomatedScripts.shared import DockerUtils

def getNumberOfEngines(db):
    print("\nGetting number of engines to run...")
    script = """
        select 
            "engines"
        from private."JobContainerControl"
        where "type" = 'Scheduled Jobs'
    """
    print("Executing query: " + script)
    db._cur.execute(script)
    result = db._cur.fetchall()
    engineCount = 0
    if(len(result) > 0):
        engineCount = result[0][0]
    print("Maximum number of engines to run: " + str(engineCount))
    return engineCount


def getQueuedJob(db, server, engine):
    # call out to mark a job for the engine
    print("\nGetting a job for engine: " + str(engine))
    script = """
        call private."GetJobQueueLock"('""" + server + """',""" + engine + """);
    """
    print("Executing query: " + script)
    db._cur.execute(script)
    # get the job that was marked
    script = """
        select 
            j."id" as "JobQueueId",
            j."jobId",
            j."stepId",
            js."type",
            js."timeout",
            js."arguments",
            js."scriptPath",
            cc."image_name",
            cc."container_name",
            cc."memory_limit",
            cc."cpus_to_run_on",
            cc."cpu_shares",
            cc."cpu_period",
            cc."cpu_quota",
            cc."mem_reservation",
            cc."auto_remove",
            cc."pids_limit"
        from private."JobQueue" j
        left join private."ScheduledJobs" s on s."id" = j."jobId"
        left join private."JobSteps" js on js."id" = j."stepId"
        left join private."JobContainerControl" cc on cc."id" = js."ContainerControlId"
        where j."engine" = """ + engine + """
        and j."server" = '""" + server + """'
        and j.pending
        and (((EXTRACT(EPOCH FROM(CURRENT_TIMESTAMP - j."assignedAt"))::integer)/60) < 2)
        order by j."assignedAt" desc
        limit 1
    """
    print("Executing query: " + script)
    db._cur.execute(script)
    result = db._cur.fetchall()
    return result

def updateStartedJob(db, jobQueueIds):
    if(len(jobQueueIds) < 1):
        return
    idString = ""
    for id in jobQueueIds:
        idString = idString + str(id) + ","
    idString = idString[:len(idString) - 1]
    # call out to mark a job for the engine as started
    script = """
        update private."JobQueue"
            set
                "pending" = False,
                "startedAt" = CURRENT_TIMESTAMP
        where "id" in (""" + idString + """)
    """
    print("Executing query: " + script)
    db._cur.execute(script)


def updateJobNotStarted(db, jobQueueIds):
    if(len(jobQueueIds) < 1):
        return
    idString = ""
    for id in jobQueueIds:
        idString = idString + str(id) + ","
    idString = idString[:len(idString) - 1]
    # call out to mark a job for the engine as started
    script = """
        update private."JobQueue"
            set
                "pending" = null,
                "assignedAt" = null,
                "engine" = null,
                "server" = null
        where "id" in (""" + idString + """)
    """
    print("Executing query: " + script)
    db._cur.execute(script)




def main(logger, db, extras, jobId, jobDetailsId, arguments):
    dockerCli = docker.from_env()
    server = os.getenv('SERVER')
    environment = os.getenv('ENVIRONMENT')
    if(server is None):
        server = "Unknown"
    # get the running containers that were started from the python-engine image
    containers = dockerCli.containers.list(filters={'ancestor':'python-engine'})
    print("Containers running:")
    print(containers)
    print("Running containers: " + str(len(containers)))

    # remove any python-engine containers that are not running
    containersToRemove = dockerCli.containers.list(filters={'ancestor':'python-engine', 'status':'exited'})
    print("\nContainers not running: " + str(len(containersToRemove)))
    print(containersToRemove)
    for container in containersToRemove:
        print("Removing container: " + container.name)
        container.remove()

    numContainersToRun = getNumberOfEngines(db)    
    # if less than max containers are running
    if(len(containers) < numContainersToRun):
        counter = 1
        keys = {}
        # create a dictionary of all the engine number keys
        while(counter <= numContainersToRun):
            keys[str(counter)] = True
            counter = counter + 1
        print("\nStripping engine numbers from containers currently running:")
        # iterate through the active engines to see which numbers are in use
        for container in containers:
            name = container.name
            # get the characters after job-engine-
            engine = name[11:]
            print(engine)
            del keys[engine]
        print("Engines not in use:")
        print(keys)

        startedJobs = []
        # iterate through the available engines to try to start them
        for engine in keys:
            # get a job from the queue for this server/engine pair
            result = getQueuedJob(db, server, engine)
            # if no job was returned, done trying to assign jobs
            if(len(result) < 1):
                print("No more jobs to run currently so exiting out of loop")
                break
            jobId = result[0][0]
            try:
                DockerUtils.startDockerContainer(dockerCli, result, engine, environment)
                startedJobs.append(jobId)
            except:
                print("An error occurred starting the container for engine " + str(engine))
                print("\nUpdating all jobs that have been successfully started:")
                updateStartedJob(db, startedJobs)
                print("Updating the job queue to indicate the job with id of " + str(jobId) + " was not started")
                updateJobNotStarted(db, [jobId])
                raise
        
        print("Updating all jobs that have been successfully started:")
        updateStartedJob(db, startedJobs)
            
        # for scalability, going to request one job at a time
        # when a job is requested, mark it as pending
        # once job is started, remove pending flag

    return "Finished Successfully"
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
from dotenv import dotenv_values

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
            cc."engines",
            cc."type",
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

def startDockerContainer(dockerCli, job, engine, environment):
    print("Starting the container for engine " + str(engine))
    # get path to source for bind mount
    source = os.path.realpath(__file__)
    source = source.partition("AutomatedScripts")[0]
    sourcePath = source + "AutomatedScripts"
    mount = docker.types.Mount(source=sourcePath,target="/home/AutomatedScripts", type="bind")
    # get path to environment variables file
    configPath = ""
    if(environment == "LOCAL-DEV" or environment == "DEV"):
        configPath = "/Docker/dev.env"
    elif(environment == "PROD"):
        configPath = "/Docker/prod.env"
    # read the environment variables into a dict
    config = dict(dotenv_values(sourcePath + configPath))
    config["ENGINE"] = str(engine)

    jobId = str(job[0][1])
    stepId = str(job[0][2])
    timeout = job[0][4] if job[0][4] is not None else 0
    arguments = job[0][5] if job[0][5] is not None else ""
    scriptPath = job[0][6]
    memoryLimit = job[0][9] if job[0][9] is not None else ""
    cpusToRunOn = job[0][10] if job[0][10] is not None else ""
    cpuShares = job[0][11] if job[0][11] is not None else 0
    cpuPeriod = job[0][12] if job[0][12] is not None else 0
    cpuQuota = job[0][13] if job[0][13] is not None else 0
    # this is like cpu shares but for memory
    memReservation = job[0][14] if job[0][14] is not None else ""
    autoRemove = job[0][15] if job[0][15] is not None else True
    pidsLimit = job[0][16] if job[0][16] is not None else 100
    print("Timeout: " + str(timeout))
    print("Arguments: " + str(arguments))
    print("Script path: " + scriptPath)
    print("Memory limit: " + str(memoryLimit))
    print("CPUs to run on: " + str(cpusToRunOn))
    print("CPU shares: " + str(cpuShares))
    print("CPU period: " + str(cpuPeriod))
    print("CPU Quota: " + str(cpuQuota))
    print("Memory Reservation: " + str(memReservation))
    print("Auto remove: " + str(autoRemove))
    print("PIDs limit: " + str(pidsLimit))

    #have table set up and pulled in query here but need to just update command below
    # path here is the path to the script to run, only used for lock file
    command = "timeout --kill-after=10 " + str(timeout) + " python3 -m AutomatedScripts.Scripts.ScriptController -path " + scriptPath + " -jobId " + jobId + " -stepId " + stepId
    print("Command to run: " + command)

    # may need to add some stuff for networking...
        # jobs running database cleanup should not need full network access
        # jobs to get movies into db will need more access to outside...
        # redis job will only need redis access
        # could also try to make containers for those specific jobs?
    # restart policy?
    # user - what user to run the container as?

    dockerCli.containers.run(image='python-engine', command='bash -c "' + command + '"',
     mounts=[mount], auto_remove=autoRemove, detach=True,environment=config, name="job-engine-" + str(engine),
     cpuset_cpus=cpusToRunOn, cpu_shares=cpuShares, cpu_period=cpuPeriod, cpu_quota=cpuQuota,
     mem_limit=memoryLimit, mem_reservation=memReservation, pids_limit=pidsLimit)


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
                startDockerContainer(dockerCli, result, engine, environment)
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
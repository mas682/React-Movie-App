from configparser import ConfigParser
import os


# function used to read the database.ini file and get the parameters from it
def config(filename=os.path.join(os.path.dirname(os.path.realpath(__file__)), 'database.ini'), section='postgresql'):
        parser = ConfigParser()
        parser.read(filename)
        db = {}
        if parser.has_section(section):
            # get the parameters for postgresql
            params = parser.items(section)
            for param in params:
                db[param[0]] = param[1]
        else:
            raise Exception('Section {0} not found in the {1} file'.format(section, filename))
        return db

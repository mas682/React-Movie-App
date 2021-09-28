FROM python
WORKDIR /home
# install the python modules needed
COPY requirements-final.txt ./
RUN pip3 install -r requirements-final.txt
#CMD ["bash"]
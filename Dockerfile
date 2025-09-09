#Pull Ubuntu 24.04 as base image
FROM ubuntu:24.04

#Install Java & other dependencies
RUN apt-get update -y &&\
    apt-get install -y software-properties-common jq unzip curl gnupg gpg default-jdk

#Install Git
RUN add-apt-repository ppa:git-core/ppa &&\
    apt update -y &&\
    apt install -y git

#Install Node.js
RUN mkdir -p /etc/apt/keyrings &&\
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg &&\
    NODE_MAJOR=18 &&\
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list &&\
    apt-get update -y &&\
    apt-get install -y nodejs

#Install Salesforce CLI & plugins
RUN npm install @salesforce/cli --global
RUN echo y | sf plugins install @salesforce/sfdx-scanner
RUN echo y | sf plugins install sfdx-git-delta
RUN sf plugins
RUN export PATH=$PATH:/usr/local/bin 

#Give docker & root users ability to execute all installed tools
RUN chmod -R go+rwx ${HOME} &&\
    chmod -R go+rwx /root

FROM ubuntu:16.04
ENV workdir /app
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    unzip \
    python-dev \
    wget \
    python-pip \
    software-properties-common \
    python-software-properties \
    osmosis \
    libz-dev \
    zlib1g-dev \
    curl \
    git \
    libtool \
    g++ \
    autotools-dev \
    automake \
    cmake \
    make \
    xutils-dev \
    realpath \
    ragel

RUN apt-get update

# Install node for some images process dependencies
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

RUN npm install geojson2poly -g

RUN wget -O - http://m.m.i24.cc/osmconvert.c | cc -x c - -lz -O3 -o osmconvert
RUN cp osmconvert /usr/bin/osmconvert

RUN mkdir $workdir
WORKDIR $workdir

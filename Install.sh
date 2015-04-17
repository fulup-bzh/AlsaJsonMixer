#!/bin/sh

# Object: Installation Helper.
# Author: Fulup Ar Foll
# Copyright: what ever will make you happy

if test -d $AJGDIR/www; then
  ROOTDIR=$AJGDIR/www
else
 if test -d /opt/ajg-daemon; then
   ROOTDIR=/opt/ajg-daemon/www
 else
   if test -d $HOME/.ajg; then
    ROOTDIR=$HOME/.ajg/www
   fi
 fi
fi

CONFIG=$HOME/.ajg/default.conf
SESSIONDIR=$HOME/.ajg/sessions
echo "------------------------------------------"
echo "Install AJM files in $ROOTDIR"
mkdir -p $ROOTDIR
mkdir -p $SESSIONDIR


if test ! -w $ROOTDIR; then
    echo "  Need root permission to write into $ROOTDIR"
    sudo cp -r --update www/* $ROOTDIR
else
    cp -r --update www/* $ROOTDIR
fi

ajg-daemon --version 2>/dev/null
if test $? -ne 0; then
  echo WARNING: AlsaJsonGateway not found [must install ajg-daemon]
else
 # save config and exit
 ajg-daemon --saveonly --sessiondir=$SESSIONDIR --rootdir=$ROOTDIR --config=$CONFIG
 AJGINSTALL=done
fi

echo "------------------------------------------"
echo "AJG/AJM: install"
echo "  - ROOTDIR=$ROOTDIR"
echo "  - SESSIONDIR=$SESSIONDIR"
echo ""
if test ! -z $AJGINSTALL; then
  echo "Start ajg-daemon with:"
  echo "  ajg-daemon --verbose --config=$CONFIG"
  echo "  ajg-daemon --daemon  --config=$CONFIG"
else
  echo "WARNING: ajg-daemon missing"
  echo " Download from https://github.com/fulup-bzh/AlsaJsonGateway"
fi
echo "------------------------------------------"


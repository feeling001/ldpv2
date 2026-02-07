#!/bin/bash
#


rsync -av * ../gh/ldpv2/
cd ../gh/ldpv2/
git add .
git commit -a -m "autocomit"
git push



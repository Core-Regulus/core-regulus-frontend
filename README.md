# Core Regulus Frontend
## How to start ?

* Install Nodejs 22 or above
* clone 
```bash
  git clone git@github.com:Core-Regulus/core-regulus-frontend.git
```
* Install dependencies
```
  cd server && npm install
```
* Build and Debug
  Go to vscode Run and Debug and start "Debug server"
  If everything is ok you should see "Server accepts connections at 9001"
* Open in Browser
  Open http://localhost:9001 in your facvorite browser
## How to update
```bash
  git pull
```
  Do it before you start to do anything

## How to commit changes
  ```bash
    git checkout -b <your-branch>
  ```
  This will create new branch and switch you to it
  Make changes you need
  ```bash
    git add .
    git commit -m "short information about changes"
  ```
  This will commit you changes locally
  ```bash
    git push
  ```
  This pushes the data to origin branch.

  Next make a pull request here https://github.com/Core-Regulus/core-regulus-frontend/pulls
## How to deploy ?
  production branch goes to https://core-regulus.com

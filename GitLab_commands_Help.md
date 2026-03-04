Steps to setup Git with SFDX Project

1)  Install Git, Git Bash, and VS Code extensions:

    -   GitLab MR
    -   GitHub Actions

2)  Create SFDX project and keep only these folders (empty):

    -   .sfdx
    -   .vscode

3)  Initialize repository: git init

4)  Add remote (replace USERNAME with your GitLab username): git remote
    add origin
    https://USERNAME@git.cloudodyssey.co.uk/cora/cora-sfcc-b2b.git

5)  Fetch branches: git fetch origin

6)  Create a new feature branch from develop: git checkout -b
    feature_Branch_Name origin/develop

7)  Push branch and set upstream: git push -u origin FeatureBranch/Name

8)  After development commit and push: git add . git commit -m "your
    commit message" git push

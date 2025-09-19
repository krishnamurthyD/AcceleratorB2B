## GitLab Setup Instructions

1)  Access

-   Ensure you have **Owner/Admin** access to the GitLab repository.

2)  Docker Hub Setup

-   A free tier Docker Hub account is enough.
-   Register here: https://hub.docker.com/
-   Save credentials: Docker_Username = "UserName" Docker_Password =
    "\*\*\*\*\*\*\*\*\*\*\*"
-   Create 2 variables in GitLab CI/CD → Variables:
    -   DOCKER_USERNAME
    -   DOCKER_PASSWORD

3)  Initial Pipeline Run

-   Open `.gitlab-ci.yml` file.
-   Comment out all sections except **"Build and Push Docker Image"**.
-   Push the code → GitLab Runner will automatically build and push your
    Docker image.
-   After completion, verify your image at:
    https://hub.docker.com/repository/docker/UserName/salesforce-cli/general
    (replace **UserName** with your Docker username)

4)  Salesforce Org Variables

-   In GitLab CI/CD → Variables, create the following:
    -   SF_AUTH_PROD = main (Production Org)
    -   SF_AUTH_UAT = release (UAT Org)
    -   SF_AUTH_INTEGRATION = develop (QA Org)

5)  Generating Auth JSON

-   In VS Code, authorize your org.
-   Run the command (replace *AuthorizationName* with your org alias):
    sf org display --target-org AuthorizationName --verbose --json
-   Copy the JSON result.
-   Remove the `"warnings"` section and ensure no extra spaces.

Example JSON (sensitive values hidden): { "status": 0, "result": { "id":
"\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*",
"apiVersion": "64.0", "accessToken":
"\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*",
"instanceUrl":
"\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*",
"username": "\*\*\*\*\*\*\*\*\*\*\*\*\*\*", "clientId": "PlatformCLI",
"connectedStatus": "Connected", "sfdxAuthUrl":
"\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*", "alias":
"Accessalator" } }

-   Save this JSON in the corresponding GitLab variable (SF_AUTH_PROD,
    SF_AUTH_UAT, SF_AUTH_INTEGRATION).

6)  Final Step

-   Restore `.gitlab-ci.yml` to its original state (uncomment all
    sections).
-   Push the code again.
-   The full GitLab pipeline will run and deploy to the Production org.

Now your GitLab setup is complete.

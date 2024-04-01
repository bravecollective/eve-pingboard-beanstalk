
Deploys https://github.com/cmd-johnson/eve-pingboard/releases

- `eb init`
  - choose Node.js 18
- `eb create --single -i t3a.nano`
- Add env vars:
    ```
    COOKIE_KEY=some-random-string
    DB_URL="mysql://user:pass@127.0.0.1/pingboard"
    SSO_CLIENT_ID="111"
    SSO_CLIENT_SECRET="aaa"
    SSO_REDIRECT_URI="https://events.bravecollective.com/auth/callback"
    SSO_TOKEN_URI="https://login.eveonline.com/v2/oauth/token"
    SSO_AUTHORIZATION_URI="https://login.eveonline.com/v2/oauth/authorize/" 
    SLACK_TOKEN="xoxb-111"
    CORE_URL="https://account.bravecollective.com/api"
    CORE_APP_ID="1"
    CORE_APP_TOKEN="1a1a1a"
    GROUPS_READ_EVENTS="member"
    GROUPS_ADD_EVENTS="fc"
    GROUPS_EDIT_EVENTS="admin"
    GROUPS_PING="member"
    GROUPS_WRITE_PING_TEMPLATES="admin"
    SESSION_REFRESH_INTERVAL=60
    SESSION_TIMEOUT=604800
    CORE_GROUP_REFRESH_INTERVAL=60
    ```
- Add security group for database access.
- `eb deploy`
- run migrations:
    ```
    sudo su webapp
    cd /var/app/current/backend/packages/backend/build/
    DB_URL="mysql://user:pass@127.0.0.1/pingboard" yarn run knex migrate:latest
    ```

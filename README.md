
Deploys https://github.com/cmd-johnson/eve-pingboard/releases

- eb init
  - choose Node.js 14
- eb create --single -i t3a.nano
- eb deploy
- Add env vars:
    ```
    DB_URL="mysql://user:pass@127.0.0.1/pingboard"
    SSO_CLIENT_ID="111"
    SSO_CLIENT_SECRET="aaa"
    SSO_REDIRECT_URI="https://events.bravecollective.com/auth/callback"
    SLACK_TOKEN="xoxb-111"
    CORE_URL="https://account.bravecollective.com/api"
    CORE_APP_ID="1"
    CORE_APP_TOKEN="1a1a1a"
    GROUPS_READ_EVENTS="member"
    GROUPS_WRITE_EVENTS="admin"
    GROUPS_PING="member"
    GROUPS_WRITE_PING_TEMPLATES="admin"
    ```
- Add security group for database access.

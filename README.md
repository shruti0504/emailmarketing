#both login and registeration generates access and refresh token 
User fills Sign Up form
        ↓
POST /auth/signup
        ↓
User account created
Workspace created
Access token generated
Refresh token generated
        ↓
User is authenticated immediately
        ↓
Frontend stores access token
Browser stores refresh token cookie
        ↓
Redirect to /dashboard

The user doesn't have to log in again.
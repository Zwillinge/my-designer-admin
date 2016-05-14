Database scheme 
=====

Collection name - field names


##user

- _id
- name
- email
- role (deprecated?)
- pass
- avatar
- team_id (team to which currently belong)
- teamrole (role in the current team - "admin", "view", "edit")
- deleted (if deleted)


##team

- _id
- name
- creator (ID of the user for whom the team was created, not for changing)
- size (number of possible members, is reduced by each new member)
- invited (array of invited members [{name:"", role:"", email:""}], if any)
- created
- modified
- deleted (if deleted)

##project

- _id 
- name
- user_id
- team_id (team ID or 0 if private)
- created
- modified
- deleted (if deleted)


##design

- _id
- name
- code
- project_id
- team_id (team ID or 0 if private)
- created
- modified
- deleted (if deleted)

##datasource

- _id
- name
- code
- team_id (0 if common, these are non-editable; all datasources are team shared) 
- deleted (if deleted)







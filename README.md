# Run the API locally

1. clone

* go to https://github.com/koniferous22/npns-prototype-backend
* on the right side of button section, above root directory of project, click button with dropdown arrow "Clone or download"
* copy the url displayed in popout
* open terminal or cmd
* run command `git clone https://github.com/koniferous22/npns-prototype-backend.git`

2. install stuff with `npm install`

3. Run somehow Mongo db locally, follow this guide https://docs.mongodb.com/manual/administration/install-community/

### After you're done, dont forget to run the service with `mongod` or sth

And pls check what port mongo uses, I assume the default is 27017, although I might be wrong, it's not like I follow their releases, I have a life

4. go to root directory, and do configuration
	1. edit .env file, change `NODE_ENV=dev` (if you pull merge-branch or sth, you don't have to)
	2. run following stuff (self explanatory), if you're windows user, pls consider changing your operating system
	```
		mkdir -p cfg/environments
		touch cfg/environments/.env.dev
	```
	3. open the file in favourite text editor and copy this there
	```
		MONGODB_HOST='mongodb://localhost:27017/npns_db'
		EPOCH_BEGIN_YEAR=2019
		EPOCH_BEGIN_MONTH=12
		EPOCH_BEGIN_DAY=1
		EPOCH_END_YEAR=2021
		EPOCH_END_MONTH=1
		EPOCH_END_DAY=1
		NODEMAILER_HOST=smtp.ethereal.email
		NODEMAILER_PORT=587
		NODEMAILER_USER=oren.cremin@ethereal.email
		NODEMAILER_PASSWORD=86GXzmB8sDN2u2Ycuy
		FRONTEND_EMAIL_LINK=http://localhost:3001/
		JWT_KEY=ChooseWhateverButProbablyYouWillCopyThisAnyway
		PORT=3000
	```
5. run the API with `nodemon` command

**Disclaimer**: _I have not actually tried specified steps, but I'm like 95% percent sure they should work_

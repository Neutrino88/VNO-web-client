export default {
    name: 'app',
    data () {
        return {
        	errors:{
        		auth: false,
                regist: false
			},
        	page: {
        		name: "auth",
				arg1: undefined,
				arg2: undefined,
                createRepo: {
        		    name: null,
                    description: null
                },
                createBranch:{
                    name: null
                },
                deleteBranch:{
                    name: null
                }
            },
            path: "",
			auth:{
                username: "kk",
                password: "112345"
			},
			userAccount:{},
			curRepo: {
        		id: undefined,
        		name: undefined,
        		branch: {
                    id: undefined,
                    name: undefined
                },
                commit: {
        		    id: undefined,
                    authorId: undefined,
                    message: undefined,
                    timestamp: undefined,
                    parentIds: undefined,
                    blobIds: undefined
                }
			},
			repos: {},
            users: {

            }
        }
    },
    methods: {
        call(method, uri, body = null, asinc = false) {
        	let authHeaderValue = 'Basic ' + btoa(this.userAccount.username + ':' + this.userAccount.password);

			let xhr = new XMLHttpRequest();
            xhr.open(method, this.path + uri, asinc);
            xhr.setRequestHeader("Authorization", authHeaderValue);
            xhr.setRequestHeader("Content-Type", "application/json");

			let respJson;
            xhr.onload = function(e) {
                respJson = JSON.parse(xhr.responseText);
			};
            xhr.send(body);

			return respJson;
		},
		signIn() {
            this.console("signIn()");
            this.userAccount = this.auth;
            let response = this.call("GET", '/user/me/');

			if (!response.status){
                this.userAccount = response;
                this.userAccount.password = this.auth.password;
                this.page.name = "profile";

                if (this.errors.auth) {
                    delete this.errors.auth;
                }

                this.users['' + response.id] = response;
                this.getReposAll();
            }
            else{
				this.errors.auth = true;
			}
		},
		signUp(){
            this.console("signUp()");
            this.userAccount = this.auth;

            let response = this.call("POST", '/user/register/');

            this.console('response');
            this.console(response);
            if (response.status == 200){
                this.userAccount = response;
                this.userAccount.password = this.auth.password;
                //this.page.name = "profile";

                if (this.errors.regist) {
                    delete this.errors.regist;
                }
            }
            else{
                this.errors.regist = true;
            }

            this.console(this.userAccount);
		},
		getRepoById(repoId){
            this.console("getRepoById(" + repoId + ')');
            this.repos[repoId.toString()] = this.call("GET", "/repo/" + repoId);

            if (this.repos[repoId.toString()].tagIds){
                for (let tagId in this.repos[repoId.toString()].tagIds){
                    var tag = this.getTagById(tagId);

                    //this.repos[repoId.toString()].
                }


            }
            else{
               // this.repos[repoId.toString()].tag["0"] = "tag-1";
               // this.repos[repoId.toString()].tag["2"] = "tag-2";
               // this.repos[repoId.toString()].tag["3"] = "tag-3";
            }

            this.getBranchesAll(repoId);
		},
		getReposAll(){
            this.console("getReposAll()");
        	this.repos = {};
        	for (let id in this.userAccount.repoIds){
        		this.getRepoById(this.userAccount.repoIds[id]);
			}

			//this.console("Repos:");
            //this.console(this.repos);
		},
		getBranchById(repoId, branchId){
            this.console("getBranchesById(" + repoId + ',' + branchId + ')');

            this.repos[repoId.toString()].branches[branchId.toString()] = this.call("GET", "/ref/" + repoId + '/' + branchId);

            //this.getCommitsInfoAll(repoId, branchId);
        },
		getBranchesAll(repoId){
            this.console("getBranchesAll("+repoId+')');

            this.repos[repoId.toString()].branches = {};
            for (let id in this.repos[repoId.toString()].branchIds){
                //this.console("GET" + "/ref/" + repoId + '/' + repo.branchIds[id]);
                this.getBranchById(repoId, this.repos[repoId.toString()].branchIds[id]);
            }
		},
		getCommitInfoById(repoId, branchId, revisionId){
            this.console("getCommitInfoById("+repoId+','+branchId+','+revisionId+')');
        	let url = "/r/" + repoId + '/' + branchId + '/' + revisionId + '/';

            //this.console("GET " + url);
            return this.call("GET", url);
		},
		getCommitsInfoAll(repoId, branchId){
            this.console("getCommitsInfoAll(" + repoId + ', ' + branchId + ')');
            let commits = {};

            let prevRevisionId = undefined;
            let revisionId = this.repos[repoId].branches[branchId].head;
            do{
                commits[revisionId.toString()] = this.getCommitInfoById(repoId, branchId, revisionId);

                prevRevisionId = revisionId;
                revisionId = commits[revisionId.toString()].parentIds[0];
            }while(commits[prevRevisionId.toString()].authorId != null);

            this.repos[repoId.toString()].branches[branchId.toString()].commits = commits;

            //this.console(this.repos);
		},
        setCurBranchId(branch){
			if (this.curRepo.branch.name == branch.name) {
                this.curRepo.branch.id = branch.branch;
			}

        	return branch.name;
		}        ,
		console(data){
        	console.log(data);
        	return "";
		},
        clickToRepo(repo){
            this.page.name = "repo";

            this.curRepo.name = repo.name;
            this.curRepo.id = repo.id;
            this.curRepo.branch.id = this.repos[repo.id].branchIds[0];
            this.curRepo.branch.name = this.repos[repo.id].branches[this.curRepo.branch.id].name;

            for (var branchId in this.repos[repo.id].branchIds) {
                this.getCommitsInfoAll(repo.id, this.repos[repo.id].branchIds[branchId])
            }
        },
        createNewRepo(){
            let name = this.page.createRepo.name;
            let desc = this.page.createRepo.description;

            if (name == null || name == "" || desc == null || desc == "")
                return;

            let data = {
                "name": name,
                "description": desc,
                "branchIds": null,
                "tagIds": null
            };

            this.console(JSON.stringify(data));
           // return this.call("PUT", "/repo/", JSON.stringify(data));
        },
        getUserInfo(userId){
            this.console("getUserInfo()");
            this.userAccount = this.auth;
            let response = this.call("GET", '/user/' + userId + '/');

            if (response) {
                return this.users['' + userId] = response;
            }
        },
        getUsernameById(userId){
            if (userId == null) userId = this.userAccount.id;
            this.console("getUsernameById("+userId+")");

            if (!this.users[''+userId]){
                this.getUserInfo(userId);
            }
            return this.users[''+userId].username;
        },
        convertUnixtimeToTime(timestamp){
            var date = new Date(timestamp*1000);
            var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

            return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
        },
        clickToCommit(commit){
            this.page.name = "commit";

            this.curRepo.commit = commit;
            this.curRepo.commit.id = commit.revision;

            var commitWithBlobs = this.getCommitWithBlobsById(this.curRepo.id, this.curRepo.branch.id, this.curRepo.commit.id);
            this.curRepo.commit.blobs = commitWithBlobs.blobs;

            this.console(commitWithBlobs);
            this.console(this.curRepo.commit);
        },
        getCommitWithBlobsById(repoId, branchId, revisionId){
            this.console("getCommitWithBlobsById("+repoId+','+branchId+','+revisionId+')');
            let url = "/r/full/" + repoId + '/' + branchId + '/' + revisionId + '/';

            this.console("GET " + url);
            return this.call("GET", url);
        },
        createNewBranch(){
            let name = this.page.createBranch.name;
            this.console("createNewBranch("+name+")");

            if (name == null || name == "")
                return;

            let data = {
                "name": name
            };
            var url = "/ref/"+this.curRepo.id+'/'+this.curRepo.commit.id+'/'+name;
            return this.call("PUT", url, JSON.stringify(data));
        },
        deleteBranch(){
            let name = this.page.createBranch.name;
            this.console("deleteBranch("+name+")");

            if (name == null || name == "" || name != this.curRepo.branch.name)
                return;

            var url = "/ref/"+this.curRepo.id+'/'+this.curRepo.commit.id+'/';
            //return this.call("DELETE", url);
        },
        getTagById(tagId){
            this.console("getTagById("+tagId+')');
            let response = this.call("GET", '/tag/' + this.curRepo.id + '/' + tagId);

            if (response) {
                return response;
            }
        },
	}
};
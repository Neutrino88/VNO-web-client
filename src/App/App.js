export default {
    name: 'app',
    data () {
        return {
        	errors:{
        		auth: false
			},
        	page: {
        		name: "auth",
				arg1: undefined,
				arg2: undefined
            },
            path: "",
			auth:{
                username: "",
                password: ""
			},
			userAccount:{},
			curRepo: {
        		id: undefined,
        		name: undefined,
        		branch: {
                    id: undefined,
                    name: undefined
                }
			},
			repos: {}
        }
    },
    methods: {
        call(method, uri, body, asinc = false) {
        	let authHeaderValue = 'Basic ' + btoa(this.userAccount.username + ':' + this.userAccount.password);

			let xhr = new XMLHttpRequest();
            xhr.open(method, this.path + uri, asinc);
            xhr.setRequestHeader("Authorization", authHeaderValue);
            xhr.setRequestHeader("Content-Type", "application/json");

			let respJson;
            xhr.onload = function(e) {
                respJson = JSON.parse(xhr.responseText);
			};
            xhr.send();

			return respJson;
		},
		signIn() {
            console.log("signIn()");
            //console.log(this.getCommitsInfoAll(1, 2));
            this.userAccount = this.auth;

            let response = this.call("GET", '/user/me/', null);

			if (!response.status){
                this.userAccount = response;
                this.userAccount.password = this.auth.password;
                this.page.name = "profile";

                if (this.errors.auth) {
                    delete this.errors.auth;
                }

                this.getReposAll();
            }
            else{
				this.errors.auth = true;
			}
		},
		signUp(){
            console.log("signUp()");
            this.userAccount = this.auth;

            let response = this.call("GET", '/user/register/', null);
            console.log(response);

            if (!response.status){
                this.userAccount = response;
                this.userAccount.password = this.auth.password;
                this.page.name = "profile";

                if (this.errors.regist) {
                    delete this.errors.regist;
                }
            }
            else{
                this.errors.regist = true;
            }

            console.log(this.userAccount);
		},
		getRepoById(repoId){
            console.log("getRepoById(" + repoId + ')');
            this.repos[repoId.toString()] = this.call("GET", "/repo/" + repoId, null);

            this.getBranchesAll(repoId);
		},
		getReposAll(){
            console.log("getReposAll()");
        	this.repos = {};
        	for (let id in this.userAccount.repoIds){
        		this.getRepoById(this.userAccount.repoIds[id]);
			}

            console.log(this.repos);
		},
		getBranchById(repoId, branchId){
            console.log("getBranchesById(" + repoId + ',' + branchId + ')');

            this.repos[repoId.toString()].branches[branchId.toString()] = this.call("GET", "/ref/" + repoId + '/' + branchId, null);

            //this.getCommitsInfoAll(repoId, branchId);
        },
		getBranchesAll(repoId){
            console.log("getBranchesAll("+repoId+')');

            this.repos[repoId.toString()].branches = {};
            for (let id in this.repos[repoId.toString()].branchIds){
                //console.log("GET" + "/ref/" + repoId + '/' + repo.branchIds[id]);
                this.getBranchById(repoId, this.repos[repoId.toString()].branchIds[id]);
            }
		},
		getCommitInfoById(repoId, branchId, revisionId){
        	let url = "/r/" + repoId + '/' + branchId + '/' + revisionId + '/';

            console.log("GET " + url);
            return this.call("GET", url, null);
		},
		getCommitsInfoAll(repoId, branchId){
            console.log("getCommitsInfoAll(" + repoId + ', ' + branchId + ')');
            let commits = {};

            let prevRevisionId = undefined;
            let revisionId = this.repos[repoId].branches[branchId].head;
            do{
                commits[revisionId.toString()] = this.getCommitInfoById(repoId, branchId, revisionId);

                prevRevisionId = revisionId;
                revisionId = commits[revisionId.toString()].parentIds[0];
            }while(commits[prevRevisionId.toString()].authorId != null);

            this.repos[repoId.toString()].branches[branchId.toString()].commits = commits;

            console.log(this.repos);
		},
        setCurBranchId(branch){
			if (this.curRepo.branch.name == branch.name) {
                this.curRepo.branch.id = branch.branch;
			}

        	return branch.name;
		}        ,
		console(lalala){
        	console.log(lalala);

        	return "";
		},
        clickToRepo(repo){
            if (this.curRepo.name == undefined) {
                this.curRepo.name = repo.name;
                this.curRepo.id = repo.id;
                this.curRepo.branch.id = this.repos[repo.id].branchIds[0];
                this.curRepo.branch.name = this.repos[repo.id].branches[this.curRepo.branch.id].name;

                for (var branchId in this.repos[repo.id].branchIds) {
                    this.getCommitsInfoAll(repo.id, this.repos[repo.id].branchIds[branchId])
                }
            }
            else {
                this.curRepo.name = undefined;
            }
        },
        createNewRepo(){
            let name = prompt("Repository name");
            let desc = prompt("Repository description");

            let data = {
                "name": name,
                "description": desc
            };

            console.log(JSON.stringify(data));
            this.call("POST", "/", JSON.stringify(data));
        }
	}
}
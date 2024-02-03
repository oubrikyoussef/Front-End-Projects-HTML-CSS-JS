// UI elements
const searchInput = document.querySelector('input[type="search"]');
const form = document.querySelector('form');
const formErrorMessage = document.querySelector("form p");
const repos = document.querySelector('.repos');
const loading = document.querySelector(".loading");

cloneUrl();

let displayedValue = null; 

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredValue = searchInput.value.trim();
    if (enteredValue !== "") {
        if (enteredValue !== displayedValue) { // Check if enteredValue is different from displayedValue
            const isValid = validate(enteredValue);
            if (isValid) {
                clearError();
                toggleLoading(true);
                try {
                    const fetchedInfos = await fetchInfos(enteredValue);
                    const fetchedRepos = await fetchRepos(enteredValue);

                    setGeneralInfos(fetchedInfos);
                    setReposInfos(fetchedRepos);

                    displayedValue = enteredValue; // Update displayedValue
                } catch (error) {
                    checkError(error);
                    toggleLoading(false);
                }
                setTimeout(() => {
                    document.body.style.overflow = "scroll";
                    loading.style.display = "none";
                }, 1100);
            } else {
                displayError("Please Enter A Valid Username");
            }
        } 
    } else {
        clearError();
    }
});


function validate(userName) {
    const maxCharNum = 39;
    const containsSpecialChars = /\W/.test(userName);
    const containsConsecutiveUnderscores = /_{2,}/.test(userName);
    const isTooLong = userName.length > maxCharNum;

    return !(containsSpecialChars || containsConsecutiveUnderscores || isTooLong);
}

function displayError(message) {
    form.style.border = "1px solid #f44336";
    formErrorMessage.innerText = message;
    formErrorMessage.style.display = "block";
    form.animate([{ transform: "translate(4px)", offset: 0.25 }, { transform: "translate(-4px)", offset: 0.50 }, { transform: "translate(4px)", offset: 0.75 }], { duration: 300 });
}

function clearError() {
    form.style.border = "none";
    formErrorMessage.style.display = "none";
}

async function fetchInfos(username) {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            throw new Error("User Not Found");
        }
        const data = await response.json();
        return data;
}

async function fetchRepos(username) {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error("User Not Found");
        }
        const data = await response.json();
        return data;
}

function setGeneralInfos(infos) {
    // Use the globally defined UI element variables to set user data
    const userName = document.querySelector('h3.name');
    const profile = document.querySelector('a.profile');
    const avatar = document.querySelector('.avatar');
    const joinDate = document.querySelector('.join-date .date');
    const bio = document.querySelector('.bio');
    const reposNum = document.querySelector('.repos-num');
    const followersNum = document.querySelector('.followers-num');
    const followingNum = document.querySelector('.following-num');
    const addresse = document.querySelector('.addresse');
    const blog = document.querySelector('li.blog');


    userName.innerText = infos.login;

    profile.href = `https://github.com/${infos.login}`;
    profile.innerText = `@${infos.login}`;

    avatar.src = infos.avatar_url;

    bio.innerText = infos.bio || "User Has No Bio";
    
    // Format and display the created_at date in a user-friendly format
    const createdDate = new Date(infos.created_at);
    joinDate.innerText = createdDate.toLocaleDateString();

    reposNum.innerText = infos.public_repos;

    followersNum.innerText = infos.followers;

    followingNum.innerText = infos.following;

    addresse.innerText = infos.location || "User Hasn't Set Location";

    if (infos.blog) {
        const blogLink = document.querySelector('li.blog a');
        if (blogLink) {
            blogLink.href = infos.blog;
            blogLink.innerText = infos.blog;
        }
    } else {
            blog.innerText = "User Hasn't A Blog";
    }
    
}

function setReposInfos(fetchedRepos) {
    repos.innerHTML = "";
    repos.style.textAlign = "start";

    const fetchedReposNum = fetchedRepos.length;
    for (let i = 0; i < fetchedReposNum; i++) {
        const repo = document.createElement('div');
        repo.classList.add("repo");

        const title = document.createElement("h3");
        title.classList.add("title");

        const fetchedTitle = fetchedRepos[i].full_name;

        const link = document.createElement("a");
        link.innerText = fetchedTitle;
        link.href = `https://www.github.com/${fetchedTitle}`;
        link.setAttribute("target","_blank");

        title.append(link);
        repo.append(title);

        const description = document.createElement("p");
        description.classList.add("description");
        description.innerText = fetchedRepos[i].description||"The User Hasn't Set A Description For This Repository";
        repo.append(description);

        const infosActions = document.createElement("div");
        infosActions.classList.add("infos-actions");
        repo.append(infosActions);

        const creationDate = document.createElement("p");
        creationDate.classList.add("creation-date");
        creationDate.innerText = "Created At :";
        infosActions.append(creationDate);

        const time = document.createElement("span");
        time.classList.add("time");
        const createdDate = new Date(fetchedRepos[i].created_at).toLocaleDateString();
        time.innerText = ` ${createdDate} `;
        creationDate.append(time);

        const clone = document.createElement("div");
        clone.classList.add("btn", "clone");

        const span = document.createElement("span");
        span.innerText = "Clone";
        clone.append(span);

        const cloneIcon = document.createElement("i");
        cloneIcon.classList.add("fa-solid", "fa-link");
        clone.append(cloneIcon);

        infosActions.append(clone);

        const methods = document.createElement("div");
        methods.classList.add("methods");
        clone.append(methods);

        const https = document.createElement("a");
        https.innerText = "HTTPS";
        https.href = fetchedRepos[i].clone_url;
        https.classList.add("https");
        methods.append(https);

        const ssh = document.createElement("a");
        ssh.innerText = "SSH";
        ssh.href = fetchedRepos[i].ssh_url;
        ssh.classList.add("ssh");
        methods.append(ssh);

        repos.prepend(repo);
    }
    if(!fetchedReposNum){
        repos.innerText = "This user hasnt any repo yet";
        repos.style.textAlign = "center";
    }
}

function cloneUrl() {
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (target.tagName === "A" && (target.classList.contains("https") || target.classList.contains("ssh"))) {
            e.preventDefault();

            const urlToCopy = target.href;
            navigator.clipboard.writeText(urlToCopy);

            const parentDiv = target.closest(".clone");
            const spanElement = parentDiv.querySelector("span");
            const icon = parentDiv.querySelector("i");

            icon.style.display = "none";
            spanElement.innerText = "Url Copied";

            setTimeout(() => {
                spanElement.innerText = "Clone";
                icon.style.display = "block";
            }, 700);
        }
    });
}

function toggleLoading(show) {
    document.body.style.overflow = show ? "hidden" : "scroll";
    loading.style.display = show ? "block" : "none";
}

function checkError(error){
    const message = error.message;
    if(message ==="User Not Found"){
        displayError(message);
    }
    else{
        console.error(error);
    }
}

const PASSWORD = "KAMATE2026";
const AUTH_KEY = "wasso_auth_time";
const AUTH_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

const loginSection =
document.getElementById("loginSection");

const generatorSection =
document.getElementById("generatorSection");

const loginBtn =
document.getElementById("loginBtn");

const passwordInput =
document.getElementById("passwordInput");

const loginError =
document.getElementById("loginError");

const generateBtn =
document.getElementById("generateBtn");

const canvas =
document.getElementById("invitationCanvas");

const ctx =
canvas.getContext("2d");

/* NEW: ADD RECIPIENT BUTTON */
const addRecipientBtn =
document.getElementById("addRecipientBtn");

/*
=========================================
PAGE LOAD
=========================================
*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAuthentication();

    }
);

/*
=========================================
AUTHENTICATION
=========================================
*/

function checkAuthentication(){

    const savedTime =
    localStorage.getItem(
        AUTH_KEY
    );

    if(!savedTime){

        showLogin();

        return;
    }

    const now = Date.now();

    const elapsed =
    now - Number(savedTime);

    if(elapsed < AUTH_DURATION){

        showGenerator();

    }else{

        localStorage.removeItem(
            AUTH_KEY
        );

        showLogin();
    }
}

function showLogin(){

    loginSection.style.display =
    "flex";

    generatorSection.style.display =
    "none";
}

function showGenerator(){

    loginSection.style.display =
    "none";

    generatorSection.style.display =
    "block";
}

loginBtn.addEventListener(
    "click",
    login
);

passwordInput.addEventListener(
    "keypress",
    (e)=>{

        if(e.key === "Enter"){

            login();
        }
    }
);

function login(){

    const enteredPassword =
    passwordInput.value.trim();

    if(
        enteredPassword === PASSWORD
    ){

        localStorage.setItem(
            AUTH_KEY,
            Date.now()
        );

        loginError.innerText = "";

        showGenerator();

    }else{

        loginError.innerText =
        "Incorrect password.";
    }
}

/*
=========================================
ADD RECIPIENT FUNCTIONALITY (NEW)
=========================================
*/

addRecipientBtn.addEventListener(
    "click",
    addRecipientRow
);

function addRecipientRow(){

    const container =
    document.getElementById("recipientContainer");

    const firstRow =
    container.querySelector(".recipient-row");

    const newRow =
    firstRow.cloneNode(true);

    // clear inputs in cloned row
    newRow.querySelector(".recipient-name").value = "";
    newRow.querySelector(".recipient-language").value = "en";

    container.appendChild(newRow);
}

/*
=========================================
GENERATE BUTTON
=========================================
*/

generateBtn.addEventListener(
    "click",
    generateInvitations
);

async function generateInvitations(){

    const names =
    document.querySelectorAll(
        ".recipient-name"
    );

    const languages =
    document.querySelectorAll(
        ".recipient-language"
    );

    let validEntries = 0;

    for(
        let i = 0;
        i < names.length;
        i++
    ){

        const recipientName =
        names[i].value.trim();

        if(
            recipientName === ""
        ){
            continue;
        }

        validEntries++;

        const language =
        languages[i].value;

        await generateInvitation(
            recipientName,
            language
        );
    }

    if(validEntries === 0){

        alert(
            "Please enter at least one name."
        );
    }
}

/*
=========================================
GENERATE SINGLE INVITATION
=========================================
*/

function generateInvitation(
    recipientName,
    language
){

    return new Promise(
        (resolve)=>{

            const image =
            new Image();

            image.crossOrigin =
            "anonymous";

            if(language === "fr"){

                image.src =
                "images/invitationFrench.png";

            }else{

                image.src =
                "images/invitationEnglish.png";
            }

            image.onload =
            function(){

                canvas.width =
                image.width;

                canvas.height =
                image.height;

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                ctx.drawImage(
                    image,
                    0,
                    0
                );

                drawRecipientName(
                    recipientName,
                    language
                );

                downloadImage(
                    recipientName,
                    language
                );

                resolve();
            };
        }
    );
}

/*
=========================================
TEXT DRAWING
=========================================
*/

function drawRecipientName(
    name,
    language
){

    let area;

    if(language === "fr"){

        area = {

            left:761,
            right:1006,

            top:310,
            bottom:381
        };

    }else{

        area = {

            left:739,
            right:997,

            top:310,
            bottom:380
        };
    }

    const boxWidth =
    area.right - area.left;

    const boxHeight =
    area.bottom - area.top;

    let fontSize = 30;

    let lines = [];

    while(fontSize >= 12){

        ctx.font =
        `bold ${fontSize}px Georgia`;

        lines =
        wrapText(
            name,
            boxWidth
        );

        const lineHeight =
        fontSize + 2;

        const totalHeight =
        lines.length *
        lineHeight;

        if(
            totalHeight <= boxHeight
        ){

            break;
        }

        fontSize--;
    }

    ctx.font =
    `bold ${fontSize}px Georgia`;

    ctx.fillStyle =
    "#000000";

    ctx.textAlign =
    "center";

    ctx.textBaseline =
    "middle";

    const lineHeight =
    fontSize + 2;

    const totalHeight =
    lines.length *
    lineHeight;

    let startY =
    area.top +
    (boxHeight - totalHeight)/2 +
    (lineHeight/2);

    const centerX =
    area.left +
    (boxWidth / 2);

    lines.forEach(
        (line,index)=>{

            ctx.fillText(
                line,
                centerX,
                startY +
                (index * lineHeight)
            );
        }
    );
}

/*
=========================================
WORD WRAPPING
=========================================
*/

function wrapText(
    text,
    maxWidth
){

    const words =
    text.split(" ");

    const lines = [];

    let currentLine = "";

    for(
        let i = 0;
        i < words.length;
        i++
    ){

        const testLine =
        currentLine +
        words[i] +
        " ";

        const width =
        ctx.measureText(
            testLine
        ).width;

        if(
            width > maxWidth &&
            currentLine !== ""
        ){

            lines.push(
                currentLine.trim()
            );

            currentLine =
            words[i] + " ";

        }else{

            currentLine =
            testLine;
        }
    }

    if(
        currentLine.trim() !== ""
    ){

        lines.push(
            currentLine.trim()
        );
    }

    return lines;
}

/*
=========================================
DOWNLOAD
=========================================
*/

function downloadImage(
    recipientName,
    language
){

    let filename =
    createFileName(
        recipientName,
        language
    );

    const link =
    document.createElement("a");

    link.download =
    filename;

    link.href =
    canvas.toDataURL(
        "image/jpeg",
        1.0
    );

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );
}

/*
=========================================
FILENAME GENERATION
=========================================
*/

function createFileName(
    recipientName,
    language
){

    let cleanName =
    recipientName
    .toLowerCase()
    .trim()
    .replace(
        /[^a-z0-9\s]/g,
        ""
    )
    .replace(
        /\s+/g,
        "_"
    );

    if(language === "fr"){

        return (
            cleanName +
            "_invitation_contribution_mariage_wasso.jpg"
        );

    }else{

        return (
            cleanName +
            "_wasso_marriage_invitation_contribution.jpg"
        );
    }
}
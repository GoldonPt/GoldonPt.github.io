import Sheet from './modules/sheetsAPI.js';
import Colors from './modules/colors.js';

function checkIndividual(turno) {
    if (turno.includes("_")) {
        let split = turno.split("_");

        // [!] MUDAR PARA CADA SEMESTRE / CURSO
        const cadeiras = [
            "enz",
            "pea",  // maybe mudar?
            "mrqb",
            "mrb",
            "qa",
        ]
        
        if (!cadeiras.includes(split[0])) {
            console.log(`Error: turno '${turno}' não está escrito de acordo com a sintaxe`);
            return false;
        }


        if (!["1", "2", "3", "4", "5", "6"].includes(split[1].slice(-1))) {
            console.log(`Error: turno '${turno}' não está escrito de acordo com a sintaxe`);
            return false;
        }


        if (!["tp", "p"].includes(split[1].slice(0, -1))) {
            console.log(`Error: turno '${turno}' não está escrito de acordo com a sintaxe`);
            return false;
        }
        return true;
    } else {
        console.log(`Error: turno '${turno}' não está escrito de acordo com a sintaxe`);
        return false;
    }
}

function checkInput(input) {
    // verifica se o input do form está bem escrito (sintaticamente)
    if (input.includes(",")) {
        let split = input.split(", ");
        for (const str of split) {
            if (!checkIndividual(str)) {
                return false;
            }
        }
        return true;
    } else {
        return checkIndividual(input);
    }
}

function sleep(ms) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms) {
            break;
        }
    }
}

function onFormSubmit() {
    const inputs = document.querySelectorAll(".inp");
    let dict = {};
    for (const inp of inputs) {
        if (inp.name.startsWith("turnos")) {
            if (!checkInput(inp.value)) {
                alert(`AVISO: Erro de sintaxe encontrado em '${inp.value}'. Exemplo de forma correta: 'qa_p4, enz_tp1, mrqb_tp2'`);
                return;
            }
        } else if (inp.name == "email") {
            if (!inp.value.endsWith("@campus.fct.unl.pt")) {
                alert("AVISO: O email tem de ser o email da faculdade associado ao respetivo número de aluno");
                return;
            }
        }
        dict[inp.name] = inp.value;
    }

    const sheet = new Sheet(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrlIgPX732zvYFPAqbp6kIWaK06PxVPHENfmNZaqhA1a2RS7N6TFC_Ja2-cVwS8DvsTrUaJD_vA_mv/pubhtml",
        "https://docs.google.com/forms/d/e/1FAIpQLSdcCxTC5axekVjqaTp-ihA950goJG08rHnPoImyQ2ax5fb1gg/viewform",
        ["entry.843858403", "entry.1692818272", "entry.1205434034", "emailAddress"],
        ["numeroAluno",     "turnosDar",        "turnosQuerer",     "email"]
    );

    chrome.storage.sync.get(['numero'], ({ numero }) => {
        let link = sheet.getWriteLink([
            numero, 
            dict["turnosDar"], 
            dict["turnosQuerer"], 
            dict["email"]
        ]);
        chrome.tabs.create({ 
            active: false, 
            url: link
        }, 
        (tab) => {
            sleep(1000);
            chrome.tabs.remove(tab.id);
        });
    });

    cancelForm();
}

function cancelForm() {
    const overlay = document.querySelectorAll("._overlay");
    overlay.forEach((value) => {value.remove()});
}

function deleteSubmission() {
    const inputs = document.querySelectorAll(".inp");
    let dict = {};
    for (const inp of inputs) {
        dict[inp.name] = inp.value;
    }

    if (!dict.email) {
        alert("AVISO: Para eliminar a submissão é necessário introduzir o email e ter um número de aluno válido e correspondente ao email");
        return;
    }

    const sheet = new Sheet(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrlIgPX732zvYFPAqbp6kIWaK06PxVPHENfmNZaqhA1a2RS7N6TFC_Ja2-cVwS8DvsTrUaJD_vA_mv/pubhtml",
        "https://docs.google.com/forms/d/e/1FAIpQLSdcCxTC5axekVjqaTp-ihA950goJG08rHnPoImyQ2ax5fb1gg/viewform",
        ["entry.843858403", "entry.1692818272", "entry.1205434034", "emailAddress"],
        ["numeroAluno",     "turnosDar",        "turnosQuerer",     "email"]
    );
    
    chrome.storage.sync.get(['numero'], ({ numero }) => {
        let link = sheet.getWriteLink([
            numero, 
            "", 
            "", 
            dict["email"]
        ]);
        chrome.tabs.create({ 
            active: false, 
            url: link
        }, 
        (tab) => {
            sleep(1000);
            chrome.tabs.remove(tab.id);
        });
    });

    cancelForm();
}

// TODO DPS meter so dataset-data em vez de email/phone e meter a mesma função pos dois :)
function phonePost() {
    let text = this.dataset.phone;
    navigator.clipboard.writeText(text).then(function() {
        alert(`Copiado '${text}' para a clipboard!`);
    });
}

function emailPost() {
    let text = this.dataset.email;
    navigator.clipboard.writeText(text).then(function() {
        alert(`Copiado '${text}' para a clipboard!`);
    });
}

function savePost() {
    const cell = this.parentElement.parentElement;
    let isSaved = cell.classList.toggle("saved");
    if (isSaved) {
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M48 0H336C362.5 0 384 21.49 384 48V487.7C384 501.1 373.1 512 359.7 512C354.7 512 349.8 510.5 345.7 
            507.6L192 400L38.28 507.6C34.19 510.5 29.32 512 24.33 512C10.89 512 0 501.1 0 487.7V48C0 21.49 21.49 0 48 0z"/>
        </svg>`
        chrome.storage.sync.get(['savedPosts'], ({ savedPosts }) => {
            savedPosts.push(cell.children[0].children[0].textContent);
            chrome.storage.sync.set({ savedPosts });
        });
    } 
    else {
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M336 0h-288C21.49 0 0 21.49 0 48v431.9c0 24.7 26.79 40.08 48.12 27.64L192 423.6l143.9 83.93C357.2 519.1 384 504.6 384 479.9V48C384 
            21.49 362.5 0 336 0zM336 452L192 368l-144 84V54C48 50.63 50.63 48 53.1 48h276C333.4 48 336 50.63 336 54V452z"/>
        </svg>`
        chrome.storage.sync.get(['savedPosts'], ({ savedPosts }) => {
            savedPosts = savedPosts.filter(item => item !== cell.children[0].children[0].textContent)
            chrome.storage.sync.set({ savedPosts });
        });
    }
}

function makeBox(entry, type=0) {
    const classes = ["", " saved", " matched"];
    let cls = classes[type];
    let svgs = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M336 0h-288C21.49 0 0 21.49 0 48v431.9c0 24.7 26.79 40.08 48.12 27.64L192 423.6l143.9 83.93C357.2 519.1 384 504.6 384 479.9V48C384 
            21.49 362.5 0 336 0zM336 452L192 368l-144 84V54C48 50.63 50.63 48 53.1 48h276C333.4 48 336 50.63 336 54V452z"/>
        </svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M48 0H336C362.5 0 384 21.49 384 48V487.7C384 501.1 373.1 512 359.7 512C354.7 512 349.8 510.5 345.7 
            507.6L192 400L38.28 507.6C34.19 510.5 29.32 512 24.33 512C10.89 512 0 501.1 0 487.7V48C0 21.49 21.49 0 48 0z"/>
        </svg>`
    ];
    svgs.push(svgs[0]);
    let svg = svgs[type];

    let dar = "";
    for (const cad of entry[4].split(", ")) {
        dar += `<li>${cad}</li>`
    }
    let desejar = "";
    for (const cad of entry[5].split(", ")) {
        desejar += `<li>${cad}</li>`
    }

    let extrasDict = {
        "63555": [
            "926700759",
            "Adeimy Barbosa"
        ],
        "62496": [
            "913321237",
            "Afonso Couto"
        ],
        "63646": [
            "939106405",
            "Afonso Camboa"
        ],
        "61790": [
            "915885060",
            "Ana Franco"
        ],
        "61779": [
            "Dados indisponíveis",
            "Ana Lopes"
        ],
        "62567": [
            "927527004",
            "Ana Veríssimo"
        ],
        "63623": [
            "968733667",
            "Rita Mesquita"
        ],
        "62107": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "62381": [
            "933650970",
            "Bárbara Paradela"
        ],
        "62340": [
            "916107709",
            "Beatriz Pereira"
        ],
        "62574": [
            "935743545",
            "Beatriz Barradas"
        ],
        "62417": [
            "939190217",
            "Beatriz Novais"
        ],
        "62404": [
            "913530699",
            "Beatriz Leitão"
        ],
        "62379": [
            "933844775",
            "Beatriz Martins"
        ],
        "63588": [
            "966594916",
            "Berta Chiambo"
        ],
        "62468": [
            "910956165",
            "Carlos Cardoso"
        ],
        "62367": [
            "917899428",
            "Carolina Nobre"
        ],
        "62571": [
            "962790456",
            "Carolina Rocha"
        ],
        "61708": [
            "926061305",
            "Catarina Pereira"
        ],
        "62363": [
            "917266027",
            "Catarina António"
        ],
        "62315": [
            "964718048",
            "Catarina Silva"
        ],
        "62462": [
            "931376740",
            "Catarina Paulo"
        ],
        "62489": [
            "939512303",
            "Catarina Santos"
        ],
        "62491": [
            "927285267",
            "Cátia Josué"
        ],
        "62458": [
            "925991667",
            "Cláudia Alves"
        ],
        "62541": [
            "961440320",
            "Daniel Silva"
        ],
        "63641": [
            "910795445",
            "Daniela Mestre"
        ],
        "62485": [
            "937519677",
            "Daniela Parente"
        ],
        "62830": [
            "917209563",
            "Diana Lopes"
        ],
        "62555": [
            "935554373",
            "Diana Pereira"
        ],
        "62321": [
            "927249749",
            "Diogo Afonso"
        ],
        "63689": [
            "966693618",
            "Duarte Silva"
        ],
        "62578": [
            "968439698",
            "Duarte Cymerman"
        ],
        "63568": [
            "933999019",
            "Duarte Seixas"
        ],
        "58862": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "62883": [
            "916836772",
            "Filipa Ferraz"
        ],
        "63696": [
            "964688865",
            "Filipe Silva"
        ],
        "62760": [
            "935780304",
            "Frederica Cardoso"
        ],
        "62619": [
            "917984564",
            "Gonçalo Vieira"
        ],
        "62747": [
            "918857639",
            "Guilherme Caldeira"
        ],
        "63517": [
            "965011728",
            "Gustavo Ribeiro"
        ],
        "63611": [
            "936352924",
            "Henrique Simões"
        ],
        "62919": [
            "912774892",
            "Inês Santana"
        ],
        "62614": [
            "914659977",
            "Inês Perrolas"
        ],
        "62798": [
            "935933827",
            "Inês Saramago"
        ],
        "62707": [
            "925490592",
            "Inês Moreira"
        ],
        "59203": [
            "961555406",
            "Inês Pardal"
        ],
        "62725": [
            "915523344",
            "Inês Pinto"
        ],
        "63626": [
            "919489171",
            "Joana Silva"
        ],
        "62672": [
            "969243573",
            "Joana Arraia"
        ],
        "62825": [
            "963012541",
            "João Oliveira"
        ],
        "62713": [
            "911840923",
            "Júlia Curto"
        ],
        "63438": [
            "926669176",
            "Juliana Peixoto"
        ],
        "62673": [
            "960454393",
            "Leonardo Miranda"
        ],
        "62821": [
            "962723882",
            "Leonor Santos"
        ],
        "62795": [
            "917667784",
            "Luísa Guerreiro"
        ],
        "63321": [
            "910764876",
            "Mafalda Loureiro"
        ],
        "63241": [
            "934601431",
            "Marco Lopes"
        ],
        "62982": [
            "910113089",
            "Margarida Pereira"
        ],
        "63682": [
            "911147395",
            "Margarida Barros"
        ],
        "63004": [
            "934371244",
            "Margarida Carvalho"
        ],
        "60489": [
            "Dados indisponíveis",
            "Maria Pereira"
        ],
        "63636": [
            "935646031",
            "Maria Roque"
        ],
        "63017": [
            "929262473",
            "Maria Canning"
        ],
        "63214": [
            "918641185",
            "Maria Fonseca"
        ],
        "62973": [
            "936866513",
            "Mariana Silva"
        ],
        "63133": [
            "965189289",
            "Mariana Fernandes"
        ],
        "63066": [
            "936665673",
            "Mariana Seco"
        ],
        "63062": [
            "912242353",
            "Mariana Pita"
        ],
        "61834": [
            "915092660",
            "Marta Fonseca"
        ],
        "63204": [
            "910775361",
            "Marta Henriques"
        ],
        "62958": [
            "932841331",
            "Marta Guinote"
        ],
        "63052": [
            "910861372",
            "Matilde Esteves"
        ],
        "63253": [
            "935435512",
            "Matilde Matias"
        ],
        "61709": [
            "968802164",
            "Miguel Andrade"
        ],
        "63590": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "51209": [
            "Dados indisponíveis",
            "Pedro Paixão"
        ],
        "63234": [
            "935461429",
            "Pedro Homem"
        ],
        "62950": [
            "919043332",
            "Raquel Neves"
        ],
        "63007": [
            "917936495",
            "Raquel Carvalho"
        ],
        "62947": [
            "966682832",
            "Raquel Peres"
        ],
        "63182": [
            "Dados indisponíveis",
            "Raquel Gomes"
        ],
        "62971": [
            "927632195",
            "Ricardo Gatinho"
        ],
        "63003": [
            "963698506",
            "Rita Vieira"
        ],
        "62986": [
            "936734744",
            "Rita Leal"
        ],
        "63512": [
            "960394499",
            "Rodrigo Dias"
        ],
        "63330": [
            "926436675",
            "Sofia Mendes"
        ],
        "63366": [
            "925875148",
            "Sofia Ferreira"
        ],
        "61801": [
            "964838506",
            "Sofia Argueles"
        ],
        "63637": [
            "927701925",
            "Sofia Mansilha"
        ],
        "63717": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "63389": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "60743": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ],
        "58493": [
            "Dados indisponíveis",
            "Tibna Cumba"
        ],
        "58368": [
            "968659051",
            "Tomás Rodrigues"
        ],
        "63576": [
            "Dados indisponíveis",
            "Vanira Barros"
        ],
        "63396": [
            "920314702",
            "Verónica Karlovych"
        ],
        "63428": [
            "Dados indisponíveis",
            "Vitória Fernandes"
        ],
        "63547": [
            "Dados indisponíveis",
            "Dados indisponíveis"
        ]
    };
    let phoneNumber = extrasDict[entry[1]][0];
    // let phoneNumber = "966693618";  // place holder [DELETE AFTER]
    let nome = extrasDict[entry[1]][1];
    // let nome = "Duarte Silva";  // place holder [DELETE AFTER]

    return `<div class="cell${cls}" title="${nome}">
                <div class="cell-header">
                    <h2>${entry[1]}</h2>
                    <button class="save" title="Guardar Post">
                        ${svg}
                    </button>
                    <button class="email" title="Copiar email do autor do post" data-email="${entry[2]}@campus.fct.unl.pt">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M0 128C0 92.65 28.65 64 64 64H448C483.3 64 512 92.65 512 128V384C512 419.3 483.3 448 448 448H64C28.65 448 0 419.3 0 384V128zM48 128V150.1L220.5 291.7C241.1 308.7 270.9 308.7 291.5 291.7L464 150.1V127.1C464 
                            119.2 456.8 111.1 448 111.1H64C55.16 111.1 48 119.2 48 127.1L48 128zM48 212.2V384C48 392.8 55.16 400 64 400H448C456.8 400 464 392.8 464 384V212.2L322 328.8C283.6 360.3 228.4 360.3 189.1 328.8L48 212.2z"/>
                        </svg>
                    </button>
                    <button class="phone" title="Copiar o número de telemóvel do autor do post" data-phone="${phoneNumber}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 
                            11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
                        </svg>
                    </button>
                    
                </div>
                <div class="give">
                    <h3>Oferece:</h3>
                    <ul>
                        ${dar}
                    </ul>
                </div>
                <div class="want">
                    <h3>Deseja:</h3>
                    <ul>
                        ${desejar}
                    </ul>
                    
                </div>
            </div>`
}

function makeBoxes() {
    chrome.storage.sync.get(['savedPosts'], ({ savedPosts }) => {

        const sheet = new Sheet(
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrlIgPX732zvYFPAqbp6kIWaK06PxVPHENfmNZaqhA1a2RS7N6TFC_Ja2-cVwS8DvsTrUaJD_vA_mv/pubhtml",
            "https://docs.google.com/forms/d/e/1FAIpQLSdcCxTC5axekVjqaTp-ihA950goJG08rHnPoImyQ2ax5fb1gg/viewform",
            ["entry.843858403", "entry.1692818272", "entry.1205434034", "emailAddress"],
            ["numeroAluno",     "turnosDar",        "turnosQuerer",     "email"]
        );

        sheet.readAll().then((value) => {
            let final = "";
            for (const entry of value.entries) {
                if (entry[4] || entry[5]) {
                    if (savedPosts.includes(entry[1])) {
                        final += makeBox(entry, 1);
                    } else {
                        final += makeBox(entry);
                    }
                }
            }
            document.querySelector(".inner_scaffold").innerHTML = final;
            for (const but of document.querySelectorAll(".save")) {
                but.addEventListener("click", savePost);
            }
            for (const but of document.querySelectorAll(".email")) {
                but.addEventListener("click", emailPost);
            }
            for (const but of document.querySelectorAll(".phone")) {
                but.addEventListener("click", phonePost);
            }
            
        });
    });
}

function checkIfPost(func) {
    chrome.storage.sync.get(['numero'], ({ numero }) => {
        if (numero === 0) {
            return;
        }
        for (const cell of document.querySelector(".inner_scaffold").children) {
            if (cell.children[0].children[0].textContent == numero) {
                const myPost = cell;
                func(myPost);
                return;
            }
        }
    });
}

function setEditableValues(post) {
    if (post !== undefined) {
        const inputs = document.querySelectorAll(".inp");
        let dict = {};
        for (const inp of inputs) {
            dict[inp.name] = inp;
        }

        let postTurnos = [ [], [] ];  // [ oferece, deseja ]
        const postLists = post.querySelectorAll("ul");
        for (let i = 0; i < 2; i++) {
            const ul = postLists[i];
            for (const li of ul.children) {
                postTurnos[i].push(li.textContent);
            }
        }

        dict.turnosDar.value = postTurnos[0].join(", ");
        dict.turnosQuerer.value = postTurnos[1].join(", ");
    }
}

function checkMyPost() {
    chrome.storage.sync.get(['numero'], ({ numero }) => {
        let link = "";
        if (numero === 0) {
            numero = "⚠️ Número de aluno indefinido! ⚠️";
            link = '<a href="https://clip.fct.unl.pt/" class="cliplink">⚠️ Se o teu número de aluno está indefinido carrega aqui e faz login! ⚠️</a>';
        }
        document.querySelector("._dummy").innerHTML = `<button class="darken _overlay"></button>
        <div class="mypost _overlay">
            <h1>Edita/Cria o Teu Post</h1>
            <span class="note">INFO: o post só será lido pelo servidor se o número de aluno e o email (da faculdade) corresponderem!</span>
            ${link}
            <div class="edit-form">
                <div class="divi">
                    <span>Email</span>
                    <input type="text" class="inp" name="email">
                </div>
                <div class="divi">
                    <span>Número de Aluno</span>
                    <span>${numero}</span>
                </div>
                <div class="divi">
                    <span>Turnos a Oferecer</span>
                    <input type="text" class="inp" name="turnosDar">
                </div>
                <div class="divi">
                    <span>Turnos Desejados</span>
                    <input type="text" class="inp" name="turnosQuerer">
                </div>
                <div class="divi">
                    <button class="action-btn" id="cancelar">Cancelar</button>
                    <button class="action-btn" id="eliminar" title="AVISO: Para eliminar a submissão é necessário introduzir o email">Eliminar</button>
                    <button class="action-btn" id="submeter">Submeter</button>
                </div>
            </div>
        </div>`;

        document.querySelector(".darken").addEventListener("click", cancelForm);
        document.getElementById("cancelar").addEventListener("click", cancelForm);
        document.getElementById("submeter").addEventListener("click", onFormSubmit);
        document.getElementById("eliminar").addEventListener("click", deleteSubmission);

        checkIfPost(setEditableValues);
    });
}

function checkShow(btns, btn) {
    if (btn.classList.contains("active")) {
        for (const but of btns) {
            but.classList.remove("active")
        }

        return false;
    } else {
        for (const but of btns) {
            but.classList.remove("active")
        }
        btn.classList.add("active")

        return true;
    }
}

function showMatches() {
    let btns = document.querySelectorAll(".btn");
    btns = [btns[0], btns[1]];
    if (checkShow(btns, btns[0])) {
        checkIfPost(afterShowMatches);
    } else {
        makeBoxes();
    }
}

function afterShowMatches(post) {
    if (post !== undefined) {
        let children = document.querySelector(".inner_scaffold").children;

        let postLists = post.querySelectorAll("ul");
        for (const cell of Array.from(children).slice()) {
            if (cell !== post) {
                let lists = cell.querySelectorAll("ul");
                let matched = false;
                
                Loop: for (const item1 of postLists[1].children) {
                    for (const item2 of lists[0].children) {
                        if (item1.textContent === item2.textContent) {
                            matched = true;
                            break Loop;
                        }
                    }
                }

                if (!matched) {
                    cell.remove();
                }
            } else {
                cell.remove();
            }
        }
    } else {
        alert("INFO: Para ver as Matches é necessário ter um post ativo! \nCarrega no '+' para postar \n\n(Nota: Posts podem demorar até 5 minutos a publicar)");
    }
}

function showSaved() {
    let btns = document.querySelectorAll(".btn");
    btns = [btns[0], btns[1]];
    if (checkShow(btns, btns[1])) {
        let children = document.querySelector(".inner_scaffold").children;

        for (const cell of Array.from(children).slice()) {
            if (!cell.classList.contains("saved")) {
                cell.remove();
            }
        }
    } else {
        makeBoxes();
    }
}

function main() {
    Colors.checkModes();
    makeBoxes();
    
    document.querySelector(".plus").addEventListener("click", checkMyPost);
    document.querySelector("#myPost").addEventListener("click", checkMyPost);
    document.querySelector("#saved").addEventListener("click", showSaved);
    document.querySelector("#matches").addEventListener("click", showMatches);
    document.querySelector("#update").addEventListener("click", makeBoxes);

    Colors.addOnChangeListener();
}

main();

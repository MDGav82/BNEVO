/* js/app.js */

// NOTE: Plus d'imports ici. Les données sont chargées avant ce fichier via HTML.

function updateNavBar() {
    const navBar = document.getElementById('nav-bar');
    navBar.innerHTML = '';
    
    if (currentRole !== 'none') {
        const disconnectButton = document.createElement('button');
        disconnectButton.id = 'btn-deconnexion-global';
        disconnectButton.className = 'btn-danger';
        disconnectButton.textContent = 'Déconnexion';
        disconnectButton.onclick = globalDisconnect;
        navBar.appendChild(disconnectButton);
    }
}

function globalDisconnect() {
    localStorage.removeItem('orgaLoggedIn');
    if (currentRole === 'benevole') {
        localStorage.removeItem('currentBenevoleOrga');
        const defaultUser = BENEVOLES.find(b => b.isDefault);
        currentUser = defaultUser ? defaultUser.id : 'B001';
    }
    currentRole = 'none';
    switchView('accueil');
}

/** Bascule l'affichage entre les sections */
function switchView(viewId) {
    document.getElementById('accueil').style.display = 'none';
    document.getElementById('orga-login').style.display = 'none';
    document.getElementById('section-orga').style.display = 'none';
    document.getElementById('section-benevole').style.display = 'none';
    document.getElementById('nav-bar').style.display = (viewId !== 'accueil') ? 'flex' : 'none';

    if (viewId === 'accueil') {
        currentRole = 'none';
        document.getElementById('accueil').style.display = 'flex';
    } else if (viewId === 'orga-login') {
        document.getElementById('orga-login').style.display = 'flex';
    } else if (viewId === 'orga') {
        document.getElementById('section-orga').style.display = 'block';
        currentRole = 'orga';
        renderOrgaDashboard();
    } else if (viewId === 'benevole') {
        document.getElementById('section-benevole').style.display = 'block';
        currentRole = 'benevole';
        renderBenevoleProfil();
        checkBenevoleStatus();
    }
    updateNavBar();
}

// --- PARTIE ORGANISATION ---

function handleOrgaLogin(e) {
    e.preventDefault();
    const user = document.getElementById('orga-user').value;
    const pass = document.getElementById('orga-pass').value;
    const message = document.getElementById('message-orga-login');

    if (user === ORGA_CREDENTIALS.user && pass === ORGA_CREDENTIALS.pass) {
        localStorage.setItem('orgaLoggedIn', 'true');
        message.style.display = 'none';
        switchView('orga');
    } else {
        message.style.display = 'block';
    }
}

function renderOrgaDashboard() {
    document.getElementById('orga-nom-dashboard').textContent = `(${ORGANIZATION.nom})`;
    document.getElementById('code-actuel').textContent = organizationCode;
    renderOrgaCalendar();
    
    const tbodyBenevoles = document.getElementById('corps-table-benevoles');
    tbodyBenevoles.innerHTML = '';
    BENEVOLES.filter(b => !b.isDefault).forEach(b => {
        const missionsActives = MISSIONS.filter(m => m.participants.includes(b.id));
        const missionsCount = missionsActives.length;
        const row = tbodyBenevoles.insertRow();
        row.innerHTML = `
            <td>${b.prenom} ${b.nom}</td>
            <td>${b.interets.map(i => `<span class="interet-tag" style="background-color:var(--color-primary-light); color: var(--color-text);">${i}</span>`).join('')}</td>
            <td>
                ${missionsCount}
                ${missionsCount > 0 ? `<button class="btn-info btn-show-missions" data-id="${b.id}">Voir</button>` : ''}
            </td>
        `;
    });
    
    document.querySelectorAll('.btn-show-missions').forEach(button => {
        button.onclick = (e) => showBenevoleMissionsModal(e.target.dataset.id);
    });

    const listeMissionsOrga = document.getElementById('liste-missions-orga');
    listeMissionsOrga.innerHTML = '';
    MISSIONS.forEach(m => {
        const dateRange = (m.date === m.dateFin || !m.dateFin) ? m.date : `${m.date} au ${m.dateFin}`;
        const li = document.createElement('li');
        li.classList.add('mission-list-item');
        li.innerHTML = `
            <div class="mission-info">
                <strong>${m.titre} (${dateRange})</strong>
                <span style="margin-left: 10px;">Participants: ${m.participants.length}</span>
            </div>
            <div class="mission-actions">
                <button class="btn-action btn-detail-mission" data-id="${m.id}" data-mode="orga">Gérer</button>
            </div>
        `;
        listeMissionsOrga.appendChild(li);
    });
    
    document.querySelectorAll('.btn-detail-mission').forEach(button => {
        button.onclick = () => showMissionModal(button.dataset.id, button.dataset.mode);
    });
}

/** Ouvre la modale listant les missions d'un bénévole donné */
function showBenevoleMissionsModal(benevoleId) {
    const benevole = BENEVOLES.find(b => b.id === benevoleId);
    if (!benevole) return;
    
    const missions = MISSIONS.filter(m => m.participants.includes(benevoleId));
    const modal = document.getElementById('modal-liste-missions');
    const listeUl = document.getElementById('liste-missions-benevole-detail');
    
    document.getElementById('titre-missions-benevole').textContent = `Missions de ${benevole.prenom} ${benevole.nom}`;
    listeUl.innerHTML = '';
    
    if (missions.length === 0) {
        listeUl.innerHTML = '<li>Ce bénévole n\'est inscrit à aucune mission.</li>';
    } else {
        missions.forEach(m => {
            const dateRange = (m.date === m.dateFin || !m.dateFin) ? m.date : `${m.date} au ${m.dateFin}`;
            const li = document.createElement('li');
            li.style.borderBottom = '1px dotted #444';
            li.style.padding = '5px 0';
            li.innerHTML = `<strong>${m.titre}</strong> (${dateRange})`;
            listeUl.appendChild(li);
        });
    }
    modal.style.display = 'flex';
}

function renderOrgaCalendar() {
    const calendarGrid = document.getElementById('calendrier-grille');
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    document.getElementById('mois-actuel').textContent = `🗓️ ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

    calendarGrid.innerHTML = `
        <div style="font-weight: bold; color: var(--color-primary-text);">Lun</div><div style="font-weight: bold; color: var(--color-primary-text);">Mar</div><div style="font-weight: bold; color: var(--color-primary-text);">Mer</div>
        <div style="font-weight: bold; color: var(--color-primary-text);">Jeu</div><div style="font-weight: bold; color: var(--color-primary-text);">Ven</div><div style="font-weight: bold; color: var(--color-primary-text);">Sam</div>
        <div style="font-weight: bold; color: var(--color-primary-text);">Dim</div>
    `;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDayOfMonth.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    const offset = (startDayOfWeek - 1);

    for (let i = 0; i < offset; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendrier-jour');
        emptyDay.style.visibility = 'hidden';
        calendarGrid.appendChild(emptyDay);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendrier-jour');
        dayDiv.textContent = i;
        
        const dayString = i.toString().padStart(2, '0');
        const monthString = (month + 1).toString().padStart(2, '0');
        const dateISO = `${year}-${monthString}-${dayString}`;
        
        const missionsDuJour = MISSIONS.filter(m => {
            const dateDebut = new Date(m.date);
            const dateFin = m.dateFin ? new Date(m.dateFin) : dateDebut;
            const currentDate = new Date(dateISO);
            
            dateDebut.setHours(0,0,0,0);
            dateFin.setHours(0,0,0,0);
            currentDate.setHours(0,0,0,0);
            
            return currentDate >= dateDebut && currentDate <= dateFin;
        });
        
        if (missionsDuJour.length > 0) {
            dayDiv.classList.add('has-mission');
            dayDiv.title = missionsDuJour.map(m => m.titre).join('\n');
        }
        
        dayDiv.onclick = () => showMissionModal('NEW', 'create', dateISO);
        
        calendarGrid.appendChild(dayDiv);
    }
}

function navigateCalendar(direction) {
    if (direction === 'prev') {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
    } else if (direction === 'next') {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    renderOrgaDashboard();
}

// --- PARTIE BENEVOLE ---

function forgetOrga(code) {
    const orga = savedOrgas.find(o => o.code === code);
    if (!orga) return;
    
    if (confirm(`Êtes-vous sûr de vouloir Oublier l'organisation "${orga.nom}" ? Cela vous désinscrira de toutes ses missions et SUPPRIMERA votre profil de bénévole.`)) {
        
        MISSIONS.forEach(m => {
            m.participants = m.participants.filter(id => id !== currentUser);
        });

        BENEVOLES = BENEVOLES.filter(b => b.id !== currentUser);

        savedOrgas = savedOrgas.filter(o => o.code !== code);
        localStorage.setItem('savedOrgas', JSON.stringify(savedOrgas));
        
        localStorage.removeItem('currentBenevoleOrga');
        
        const defaultUser = BENEVOLES.find(b => b.isDefault);
        currentUser = defaultUser ? defaultUser.id : 'B001';
        
        alert(`L'organisation ${code} a été oubliée. Votre profil a été retiré de la base de données.`);
        
        checkBenevoleStatus();
        renderOrgaDashboard();
    }
}

function renderBenevoleProfil() {
    const benevole = BENEVOLES.find(b => b.id === currentUser);
    if (!benevole) return;

    const profilDiv = document.getElementById('benevole-profil');
    profilDiv.innerHTML = `
        <div class="profil-img">${benevole.photo}</div>
        <div>
            <h4>${benevole.prenom} ${benevole.nom}</h4>
            <p>Centres d'intérêt : ${benevole.interets.map(i => `<span class="interet-tag">${i}</span>`).join('')}</p>
        </div>
    `;
}

function checkBenevoleStatus() {
    const currentOrgaCode = localStorage.getItem('currentBenevoleOrga');
    
    document.getElementById('benevole-adhesion').style.display = currentOrgaCode ? 'none' : 'block';
    document.getElementById('benevole-dashboard').style.display = currentOrgaCode ? 'block' : 'none';

    renderSavedOrgaList();

    if (currentOrgaCode) {
        renderBenevoleDashboard(currentOrgaCode);
    }
}

function renderSavedOrgaList() {
    const listeDiv = document.getElementById('liste-orga-enregistrees');
    const formDiv = document.getElementById('formulaire-nouvelle-orga');

    savedOrgas = JSON.parse(localStorage.getItem('savedOrgas')) || [];
    
    if (savedOrgas.length === 0) {
        listeDiv.style.display = 'none';
        formDiv.querySelector('h4').textContent = 'Rejoindre votre Organisation :';
        return;
    }
    
    listeDiv.style.display = 'block';
    listeDiv.querySelector('h4').textContent = `Organisations Enregistrées (${savedOrgas.length}) :`;
    listeDiv.innerHTML = listeDiv.querySelector('h4').outerHTML;
    
    savedOrgas.forEach(orga => {
        const item = document.createElement('div');
        item.classList.add('orga-item');
        item.innerHTML = `
            <span>${orga.nom} (Code: ${orga.code})</span>
            <div>
                <button class="btn-action btn-connect-orga" data-code="${orga.code}">Se connecter</button>
                <button class="btn-danger btn-forget-orga" data-code="${orga.code}">Oublier</button>
            </div>
        `;
        listeDiv.appendChild(item);
    });
    
    document.querySelectorAll('.btn-connect-orga').forEach(btn => {
        btn.onclick = (e) => connectToOrga(e.target.dataset.code);
    });
    document.querySelectorAll('.btn-forget-orga').forEach(btn => {
        btn.onclick = (e) => forgetOrga(e.target.dataset.code);
    });
}

function connectToOrga(code) {
    localStorage.setItem('currentBenevoleOrga', code);
    checkBenevoleStatus();
}

function handleAdhesion(e) {
    e.preventDefault();
    const codeSaisi = document.getElementById('input-code-adhesion').value.trim();
    const messageAdhesion = document.getElementById('message-adhesion');

    if (codeSaisi === organizationCode) {
        if (!savedOrgas.find(o => o.code === codeSaisi)) {
            savedOrgas.push({ code: ORGANIZATION.code, nom: ORGANIZATION.nom });
            localStorage.setItem('savedOrgas', JSON.stringify(savedOrgas));
        }
        
        if (!BENEVOLES.find(b => b.id === currentUser)) {
            BENEVOLES.push({ id: currentUser, nom: 'Nouveau', prenom: 'Adhérent', photo: 'A', interets: ['Nouveau'], isDefault: false });
        }
        
        localStorage.setItem('currentBenevoleOrga', codeSaisi);
        messageAdhesion.style.display = 'none';
        checkBenevoleStatus();
        renderOrgaDashboard();
    } else {
        messageAdhesion.textContent = 'Code d\'organisation invalide.';
        messageAdhesion.style.display = 'block';
        messageAdhesion.style.backgroundColor = '#440000';
        messageAdhesion.style.color = '#f44336';
    }
}


function renderBenevoleDashboard(orgaCode) {
    const orga = savedOrgas.find(o => o.code === orgaCode);
    document.getElementById('orga-connectee-info').textContent = `Connecté à : ${orga ? orga.nom : 'Organisation Inconnue'} (Code: ${orgaCode})`;

    const listeDisponibles = document.getElementById('liste-missions-disponibles');
    listeDisponibles.innerHTML = '';
    
    MISSIONS.forEach(m => {
        const estInscrit = m.participants.includes(currentUser);
        const dateRange = (m.date === m.dateFin || !m.dateFin) ? m.date : `${m.date} au ${m.dateFin}`;
        const li = document.createElement('li');
        li.style.padding = '10px 0';
        li.style.borderBottom = '1px dashed #444';
        li.innerHTML = `
            <strong>${m.titre} (${dateRange})</strong> - ${m.lieu}
            <span style="margin-left: 10px;">Participants: ${m.participants.length}</span>
            <button class="btn-action btn-detail-mission" style="float:right;" data-id="${m.id}" data-mode="benevole">Détails</button>
            <span style="color:${estInscrit ? 'var(--color-primary)' : '#666'}; margin-left:10px; float:right; font-weight:bold;">${estInscrit ? 'INSCRIT' : 'Disponible'}</span>
        `;
        listeDisponibles.appendChild(li);
    });

    document.querySelectorAll('.btn-detail-mission').forEach(button => {
        button.onclick = () => showMissionModal(button.dataset.id, button.dataset.mode);
    });
}

// --- Modales ---

function showMissionModal(missionId, mode, defaultDate = null) {
    const modal = document.getElementById('modal-mission-detail');
    const mission = MISSIONS.find(m => m.id === missionId);
    const isCreation = mode === 'create';
    
    document.getElementById('modal-form-orga').style.display = (mode === 'orga' || isCreation) ? 'block' : 'none';
    document.getElementById('modal-affichage-commun').style.display = (mode === 'benevole' || (mode === 'orga' && !isCreation)) ? 'block' : 'none';
    document.getElementById('btn-sinscrire-mission').style.display = 'none';
    document.getElementById('btn-sedesinscrire-mission').style.display = 'none';
    document.getElementById('btn-supprimer-mission').style.display = (mode === 'orga' && !isCreation) ? 'inline-block' : 'none';

    
    if (mission) {
        document.getElementById('modal-titre').textContent = mission.titre;
        
        document.getElementById('mission-titre-input').value = mission.titre;
        document.getElementById('mission-lieu-input').value = mission.lieu;
        document.getElementById('mission-date-debut-input').value = mission.date;
        document.getElementById('mission-date-fin-input').value = mission.dateFin || '';
        document.getElementById('mission-description-input').value = mission.description || '';
        
        const dateRange = (mission.date === mission.dateFin || !mission.dateFin) ? mission.date : `${mission.date} au ${mission.dateFin}`;
        document.getElementById('mission-lieu-affichage').textContent = mission.lieu;
        document.getElementById('mission-date-affichage').textContent = dateRange;
        document.getElementById('mission-description-affichage').textContent = mission.description || 'Aucune description fournie.';
        document.getElementById('compteur-participants').textContent = mission.participants.length;

        const participantsListe = document.getElementById('participants-liste');
        participantsListe.innerHTML = '';
        mission.participants.forEach(pId => {
            const participant = BENEVOLES.find(b => b.id === pId);
            if (participant) {
                participantsListe.innerHTML += `<div class="participant-item" style="color: #181818; margin-bottom: 5px;"><strong>${participant.prenom} ${participant.nom}</strong> ${participant.interets.map(i => `<span class="interet-tag" style="background-color:var(--color-primary-light); color: var(--color-text);">${i}</span>`).join('')}</div>`;
            }
        });
    } else {
        document.getElementById('modal-titre').textContent = 'Créer une Nouvelle Mission';
        document.getElementById('mission-titre-input').value = '';
        document.getElementById('mission-lieu-input').value = '';
        document.getElementById('mission-date-debut-input').value = defaultDate || '';
        document.getElementById('mission-date-fin-input').value = '';
        document.getElementById('mission-description-input').value = '';
        document.getElementById('btn-supprimer-mission').style.display = 'none';
    }

    if (mode === 'benevole' && mission) {
        const estInscrit = mission.participants.includes(currentUser);
        if (estInscrit) {
            document.getElementById('btn-sedesinscrire-mission').style.display = 'block';
            document.getElementById('btn-sedesinscrire-mission').onclick = () => desinscrireMission(mission.id);
        } else {
            document.getElementById('btn-sinscrire-mission').style.display = 'block';
            document.getElementById('btn-sinscrire-mission').onclick = () => inscrireMission(mission.id);
        }
    }
    
    if (mode === 'orga' || isCreation) {
        document.getElementById('btn-sauvegarder-mission').onclick = () => saveMission(mission ? mission.id : 'NEW', isCreation);
    }
    if (mode === 'orga' && !isCreation) {
        document.getElementById('btn-supprimer-mission').onclick = () => deleteMission(mission.id);
    }

    modal.style.display = 'flex';
}

function closeMissionModal() {
    document.getElementById('modal-mission-detail').style.display = 'none';
}

function saveMission(missionId, isNew) {
    const titre = document.getElementById('mission-titre-input').value;
    const lieu = document.getElementById('mission-lieu-input').value;
    const date = document.getElementById('mission-date-debut-input').value;
    const dateFin = document.getElementById('mission-date-fin-input').value;
    const description = document.getElementById('mission-description-input').value;

    if (titre.trim() === '' || lieu.trim() === '' || date.trim() === '') {
        alert("Le titre, le lieu et la date de début sont obligatoires.");
        return;
    }
    
    if (dateFin && new Date(date) > new Date(dateFin)) {
        alert("La date de fin ne peut pas précéder la date de début.");
        return;
    }

    if (isNew) {
        const newId = 'M' + (MISSIONS.length + 1).toString().padStart(3, '0');
        MISSIONS.push({ id: newId, titre, lieu, date, dateFin: dateFin || date, description, participants: [] });
        alert(`Mission créée : ${titre}`);
    } else {
        const mission = MISSIONS.find(m => m.id === missionId);
        if (mission) {
            mission.titre = titre;
            mission.lieu = lieu;
            mission.date = date;
            mission.dateFin = dateFin || date;
            mission.description = description;
            alert(`Mission modifiée : ${titre}`);
        }
    }
    closeMissionModal();
    renderOrgaDashboard();
    if (localStorage.getItem('currentBenevoleOrga')) renderBenevoleDashboard(localStorage.getItem('currentBenevoleOrga'));
}

function deleteMission(missionId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) {
        MISSIONS = MISSIONS.filter(m => m.id !== missionId);
        alert("Mission supprimée.");
        closeMissionModal();
        renderOrgaDashboard();
        if (localStorage.getItem('currentBenevoleOrga')) renderBenevoleDashboard(localStorage.getItem('currentBenevoleOrga'));
    }
}

function inscrireMission(missionId) {
    const mission = MISSIONS.find(m => m.id === missionId);
    if (mission && !mission.participants.includes(currentUser)) {
        mission.participants.push(currentUser);
        alert(`Vous êtes inscrit à : ${mission.titre}`);
    }
    closeMissionModal();
    renderBenevoleDashboard(localStorage.getItem('currentBenevoleOrga'));
    renderOrgaDashboard();
}

function desinscrireMission(missionId) {
    const mission = MISSIONS.find(m => m.id === missionId);
    if (mission) {
        mission.participants = mission.participants.filter(id => id !== currentUser);
        alert(`Vous vous êtes désinscrit de : ${mission.titre}`);
    }
    closeMissionModal();
    renderBenevoleDashboard(localStorage.getItem('currentBenevoleOrga'));
    renderOrgaDashboard();
}

// --- Modale Profil Bénévole ---

function openProfilModal() {
    const benevole = BENEVOLES.find(b => b.id === currentUser);
    if (benevole.isDefault) {
        alert("Vous devez d'abord vous connecter à une organisation pour créer et modifier votre propre profil.");
        return;
    }

    document.getElementById('profil-prenom-input').value = benevole.prenom;
    document.getElementById('profil-nom-input').value = benevole.nom;
    document.getElementById('profil-photo-input').value = benevole.photo;
    document.getElementById('profil-interets-input').value = benevole.interets.join(', ');

    document.getElementById('modal-edit-profil').style.display = 'flex';
}

function handleProfilSave(e) {
    e.preventDefault();
    const benevole = BENEVOLES.find(b => b.id === currentUser);
    
    benevole.prenom = document.getElementById('profil-prenom-input').value;
    benevole.nom = document.getElementById('profil-nom-input').value;
    benevole.photo = document.getElementById('profil-photo-input').value.toUpperCase().charAt(0) || 'U';
    
    const interetsString = document.getElementById('profil-interets-input').value;
    benevole.interets = interetsString.split(',').map(i => i.trim()).filter(i => i.length > 0);
    
    alert('Profil mis à jour ! (Simulé)');
    document.getElementById('modal-edit-profil').style.display = 'none';
    renderBenevoleProfil();
    renderOrgaDashboard();
}

// --- Initialisation et Écouteurs ---

document.addEventListener('DOMContentLoaded', () => {
    const activeUser = BENEVOLES.find(b => !b.isDefault);
    const defaultUser = BENEVOLES.find(b => b.isDefault);

    if (activeUser) {
        currentUser = activeUser.id;
    } else if (defaultUser) {
        currentUser = defaultUser.id;
    }

    if (localStorage.getItem('orgaLoggedIn') === 'true') {
        switchView('orga');
    } else if (localStorage.getItem('currentBenevoleOrga')) {
        switchView('benevole');
    } else {
        switchView('accueil');
    }

    document.getElementById('btn-accueil-orga').onclick = () => switchView('orga-login');
    document.getElementById('btn-accueil-benevole').onclick = () => switchView('benevole');
    
    document.getElementById('form-orga-login').onsubmit = handleOrgaLogin;
    document.getElementById('btn-orga-cancel').onclick = () => switchView('accueil');

    document.getElementById('btn-prev-month').onclick = () => navigateCalendar('prev');
    document.getElementById('btn-next-month').onclick = () => navigateCalendar('next');

    document.querySelector('#modal-mission-detail .close-button').onclick = closeMissionModal;
    document.getElementById('close-profil-modal').onclick = () => document.getElementById('modal-edit-profil').style.display = 'none';
    document.getElementById('close-missions-benevole-modal').onclick = () => document.getElementById('modal-liste-missions').style.display = 'none';

    document.getElementById('btn-generer-code').onclick = () => {
        organizationCode = "ORGA-" + Math.floor(Math.random() * 9000 + 1000);
        document.getElementById('code-actuel').textContent = organizationCode;
        alert('Nouveau code généré : ' + organizationCode);
    };
    
    document.getElementById('form-adhesion').addEventListener('submit', handleAdhesion);
    
    document.getElementById('btn-modifier-profil').onclick = openProfilModal;
    document.getElementById('form-edit-profil').onsubmit = handleProfilSave;
});
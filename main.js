import {
    groupes,
    match_group_all,
    stat_groupe,
    order_groupe, 
    groupe_match_detail,
    startgame,
    GameIsStarted,
    Winner
} from './pronostic.js'



document.addEventListener('start',e=>{
    const pronostic_title=document.querySelector("#pronostic-state")
    if(e.detail.isstarted){
        pronostic_title.textContent="Pronostic en cours"
    }
})



DisplayGroupe()

//Evenement lorsque le pronostic commence
const btn=document.querySelector("#start-game")
btn.addEventListener("click",e=>{
    startgame()
})

//Evenement lorsque le pronostic est finie
document.addEventListener("pronostic-end",e=>{
    const modal=document.querySelector("#final-result")
    const winner_h2=document.querySelector("#winner")
    winner_h2.textContent=Winner.equipe.equipe
    modal.showModal()
})

//Femer le modal d'affichage du résultat finale
const close_result_modal=document.querySelector("#close-result-modal")
close_result_modal.addEventListener("click",e=>{
    const modal=document.querySelector("#final-result")
    //Fermer le modal
    modal.setAttribute("closing", "");
            
    //Lorsque l'animation du modal est fini
    modal.addEventListener(
    "animationend",
    () => {
        modal.removeAttribute("closing");
        modal.close();
    },
    { once: true }
    );
})

//Afficher tous les groupes (poules)
function DisplayGroupe(){
    const groupe_section=document.querySelector("#groupe-content")
    groupes.forEach(groupe => {

        const group_div=document.createElement("div")
        const group_title=document.createElement("div")
        const equipes=document.createElement("div")


        group_div.className="groupe"
        group_div.setAttribute("data-groupe",groupe.groupe)
        
        group_title.className="groupe-title"
        group_title.innerHTML=`<h3>${groupe.groupe}</h3>`

        group_div.appendChild(group_title)
        
        equipes.className="equipes"
        group_div.appendChild(equipes)

        groupe.equipes.forEach(equipe=>{
            const eq=document.createElement("div")
            eq.className="equipe"
            eq.innerHTML+=`<span>${equipe.equipe}</span>`
            equipes.appendChild(eq)
        })
        
        groupe_section.appendChild(group_div)
    });
    loadgroupclick()
    
}

//Affichage du modal lors d'un click sur un groupe
function loadgroupclick(){
    const groupes=document.querySelectorAll(".groupe")
    groupes.forEach(element => {
        const groupe=element.getAttribute("data-groupe")
        element.addEventListener("click",(e)=>{

            if(!GameIsStarted){
                return
            }
            //Obtenir le modal
            const groupe_modal=document.querySelector("#groupe-modal")

            //Les matches d'un groupe
            const m_g=groupe_match_detail(groupe)
            match_groupes(m_g)

            //Afficher le modal
            groupe_modal.showModal()

            //Button pour fermer le modal
            const closeModal=groupe_modal.querySelector(".close-modal")
            closeModal.addEventListener("click", () => {

                //Fermer le modal
                groupe_modal.setAttribute("closing", "");
            
                //Lorsque l'animation du modal est fini
                groupe_modal.addEventListener(
                "animationend",
                () => {
                    groupe_modal.removeAttribute("closing");
                    groupe_modal.close();
                },
                { once: true }
                );
            });
        })
    });
}




//Affichage des matches et points d'un groupe
function match_groupes(matches_groupe){
    const mathes_container=document.querySelector("#matches")
    mathes_container.innerHTML=``
    matches_groupe.matches.forEach(m=>{
        mathes_container.appendChild(match_detail(m))
    })
    const points=stat_groupe(matches_groupe)
    order_groupe(points)
    tablepointgroup(points)
}

//Div pour afficher les détails d'un match
function match_detail(match){
    const match_div=document.createElement("div")
    match_div.className="match"
    match_div.innerHTML=`
            <h5>${match.equipe_a.equipe.equipe}<strong class="match-score"> ${match.equipe_a.score} </strong></h5>
            <h5><strong class="match-score"> ${match.equipe_b.score} </strong>${match.equipe_b.equipe.equipe}</h5>`
    return match_div
}

//Table pour afficher les points des équipes d'un groupe
function tablepointgroup(points){
    const tbody=document.querySelector("#table-body-point")
    tbody.innerHTML=""
    points.forEach(point=>{
        const row=`<tr>
                        <td>${point.equipe.equipe}</td>
                        <td>${point.point}</td>
                        <td>${point.goal_scored}</td>
                        <td>${point.goal_entry}</td>
                    </tr>`
        tbody.innerHTML+=row
    })
}
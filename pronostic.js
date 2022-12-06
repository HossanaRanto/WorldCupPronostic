const fetchdata=await fetch("mondial.json")
const response=await fetchdata.json()

export const groupes= await response.groupes
const huitieme=await response.huitieme

export let matches_groupes=[]

export let GameIsStarted=false

function penalty(){
    const a=Math.floor(Math.random() * (6))
    const b=Math.floor(Math.random() * (6))
    if(a==b){
        console.log("same")
        return penalty()
    }

    return {penaltyA:a,penaltyB:b}
}
export function makeamatch(equipeA,equipeB,haspenalty=false){
    const score_a=Math.floor(Math.random()*10)
    const score_b=Math.floor(Math.random()*10)
    let penalty_A,penalty_B
    if(score_a==score_b && haspenalty){
        penalty_A=penalty().penaltyA
        penalty_B=penalty().penaltyB
    }

    let match={
        equipe_a:{
            equipe:equipeA,
            score:score_a,
            penalty:penalty_A
        },
        equipe_b:{
            equipe:equipeB,
            score:score_b,
            penalty:penalty_B
        }
    }

    return match

}
//Vérifier qui est le gagnand d'un match (avec penalty ou sans penalty)
function checkwinner(match){
    //Si le vainqueur est Equipe A
    if(match.equipe_a.score>match.equipe_b.score){
        return match.equipe_a
    }
    //Si le vainqueur est Equipe B
    else if(match.equipe_a.score<match.equipe_b.score){
        return match.equipe_b
    }
    //Si match nul et pas de penalty
    else if(match.equipe_a.score==match.equipe_b.score && !match.equipe_a.penalty){
        return null
    }

    //Si match nul avec penalty
    else if(match.equipe_a.score==match.equipe_b.score && match.equipe_a.penalty){
        if(match.equipe_a.penalty>match.equipe_b.penalty){
            return match.equipe_a
        }
        return match.equipe_b
    }
}
export function match_group_all(){
    const data=[]
    groupes.forEach(groupe=>{
        data.push(match_group(groupe))
    })
    GameIsStarted=true
    return data
}
export function match_group(groupe){
    const matches={groupe:groupe,matches:[]}
    for(let i=0;i<groupe.equipes.length-1;i++){
        for(let j=i+1;j<groupe.equipes.length;j++){
            const equipeA=groupe.equipes[i]
            const equipeB=groupe.equipes[j]
            const match=makeamatch(equipeA,equipeB)
            matches.matches.push(match)
        }
    }
    return matches
}
function createpoint_sheet(groupe){
    const points=[]
    groupe.equipes.forEach(equipe => {
        let point={equipe:equipe,point:0,goal_scored:0,goal_entry:0}
        points.push(point)
    });
    return points
}
export function stat_groupe(matches){
    const points=createpoint_sheet(matches.groupe)
    matches.matches.forEach(match => {
        const equipea_point=points.find(p=>{
            if(p.equipe.id==match.equipe_a.equipe.id){
                return p
            }
        })
        const equipeb_point=points.find(p=>{
            if(p.equipe.id==match.equipe_b.equipe.id){
                return p
            }
        })
        const equipea_match=match.equipe_a
        const equipeb_match=match.equipe_b

        //Compter les nombres de buts marquée de l'équipe a et b
        equipea_point.goal_scored+=equipea_match.score
        equipeb_point.goal_scored+=equipeb_match.score

        //Compter les nombres des buts entrées de l'équipe a et b
        equipea_point.goal_entry+=equipeb_match.score
        equipeb_point.goal_entry+=equipea_match.score


        if(equipea_match.score>equipeb_match.score){
            equipea_point.point+=3
        }
        else if(equipea_match.score<equipeb_match.score){
            equipeb_point.point+=3
        }
        else if(equipea_match.score==equipeb_match.score){
            equipea_point.point+=1
            equipeb_point.point+=1
        }
    });
    return points
}
//Détail des matches d'un groupe
export function groupe_match_detail(groupe){
    const match=matches_groupes.find(m=>{

        if(m.groupe.groupe==groupe)
        {
            return m
        }
    })
    return match
    
}
function order_all_groupes_point(){
    const points=[]
    groupes.forEach(groupe=>{

        //Obtenir les points
        const stat= stat_groupe(
            groupe_match_detail(groupe.groupe)
        )

        //Mettre en ordre les points selon le reglements de la FIFA
        order_groupe(stat)

        //List des équipes qualifiées pour la phase finale
        const qualifier=[]
        //1ère équipe qualifié 
        qualifier.push(stat[0])
        //2è équipe qualifié
        qualifier.push(stat[1])

        
        points.push({groupe:groupe,point:qualifier})
    })
    return points
}
export function order_groupe(point){
    point.sort((a, b) =>{
        (a.point > b.point ? -1 : 1)
        if(a.point > b.point){
            return -1
        }
        else if(a.point<b.point){
            return 1
        }
        else {
            if((a.goal_scored-a.goal_entry)>(b.goal_scored - b.goal_entry)){
                return -1
            }
            else if((a.goal_scored-a.goal_entry)<(b.goal_scored - b.goal_entry)){
                return 1
            }
        }
    })
}

export function huit_final(){
    const matches=[]
    const groupe_qualif=order_all_groupes_point()
    for(let i=0;i<groupe_qualif.length;i+=2){
        //1er du groupe 1 contre 2è du groupe 2
        const equipe1=groupe_qualif[i].point[0].equipe
        const equipe2=groupe_qualif[i+1].point[1].equipe

        const match1 = makeamatch(equipe1,equipe2,true)

        //1er du groupe 2 contre 2è du groupe 1
        const equipe3=groupe_qualif[i].point[1].equipe
        const equipe4=groupe_qualif[i+1].point[0].equipe

        const match2 = makeamatch(equipe3,equipe4,true)

        matches.push(match1)
        matches.push(match2)
    }
    return matches
}

function quart_final(huitfinal){
    const quart=[]
    const quartmatch=[]
    huitfinal.forEach(match=>{
        const gagnant=checkwinner(match)
        quart.push(gagnant.equipe)
    })

    for(let i=0;i<quart.length;i+=2){
        const match=makeamatch(quart[i],quart[i+2],true)
        quartmatch.push(match)
    }
    return quartmatch;
}
function demi_final(quart){
    const demi=[]
    const demifinalmatch=[]
    quart.forEach(match=>{
        const gagnant=checkwinner(match)
        demi.push(gagnant.equipe)
    })

    for(let i=0;i<demi.length;i+=2){
        const match=makeamatch(demi[i],demi[i+2],true)
        demifinalmatch.push(match)
    }
    return demifinalmatch;
}
function Finale(demi){
    const finale=[]
    demi.forEach(match=>{
        const gagnant=checkwinner(match)
        finale.push(gagnant.equipe)
    })
    const match=makeamatch(finale[0],finale[1],true)
    const winner=checkwinner(match)
    return {match:match,gagnant:winner}
}
//Evenement pour savoir si le pronostic a commencé
const startEvent=new CustomEvent('start',{detail:{isstarted:true}})

//Evenement pour savoir si le pronostic est terminé
const pronosticEnd=new CustomEvent('pronostic-end')

//Commencer le jeu
export function startgame(){
    //Le jeu a commencé
    GameIsStarted=true

    //Call the event
    document.dispatchEvent(startEvent)
    
    matches_groupes=match_group_all()
    order_all_groupes_point()

    const huit = huit_final()
    const quart = quart_final(huit)
    const demi= demi_final(quart)
    const finale=Finale(demi)
    document.dispatchEvent(pronosticEnd)
}


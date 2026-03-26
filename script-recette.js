const supabaseUrl = "https://omatwecxigsncfpjtsoz.supabase.co";
const supabaseKey = "sb_publishable_c0FYjEy_ZM5yESU-zkbw4g_PbdPSVSw";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const titre =localStorage.getItem("titre");
   


document.addEventListener("DOMContentLoaded", async () => {
   
   document.getElementById("button-header").style.display="flex";
   document.getElementById("titre-centre").textContent=titre;

   loadRecipe(titre);
});



function returnHomepage(){
  
  location.replace("./index.html") 
}

async function loginSupabase(email, password) {
  // Step 1: Send credentials to Supabase
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById('mail').value,
        password: document.getElementById('mdp').value,
    });

    if (error) {
        alert("Login failed: " + error.message);
        return false;
    } else {
        console.log("Logged in successfully!");
        return true;
        //location.replace("./form.html") 
        
    }
}

let loginAction=null;

async function verifyLogin(){
  let authentified=await loginSupabase();
  if(loginAction=="create" && authentified){
    location.replace("./form.html") 
  }
 
  if(loginAction=="edit" && authentified){
    location.replace("./form.html") 
  }

  else if(loginAction=="delete" && elemDelete!=null){
    if(authentified){
      authentified=false;
      console.log("delete recipe");
      let e =elemDelete;
      const ficheRecette = e.closest('.fiche-recette');
      const titre = ficheRecette.querySelector("#fiche-titre").textContent;  
      console.log("delete recipe:",titre);
      const{data,error}=await supabaseClient
        .from("recipes")
        .delete()
        .eq("titre",titre);
      e.parentNode.parentNode.remove();
      closePopup();
    }
    else{alert("You must be logged in to delete a recipe");}
  }
}


function openPopup(){
  const popup=document.getElementById("popup1");
  popup.classList.add("show");
  

}
function closePopup(){
  
  const popup=document.getElementById("popup1");
  popup.classList.remove("show");
}

function addRecipe(){
  loginAction="create";
  openPopup();
}

const quantites=[];

async function loadRecipe(titre){

  const { data, error } = await supabaseClient
  .from("recipes")
  .select("*")
  .eq("titre", titre);

  console.log("loading recipe");
  //document.getElementById("etapes").value=data[0].etapes;
  if(data[0].cuisson==null || data[0].cuisson==""){
    document.getElementById("mode-cuisson").textContent="Pas de cuisson indiquée";
  }
  else{
    document.getElementById("mode-cuisson").innerHTML=data[0].cuisson;
  }
  document.getElementById("temps").textContent=data[0].temps;
  if(data[0].notes==null){
   document.getElementById("notes-content").textContent="Aucune note pour cette recette";

  }
  else{
    document.getElementById("notes-content").textContent=data[0].notes;

  }
  document.getElementById("etapes-list").innerHTML=data[0].etapes.replace(/\n/g, "<br>");;

  const ings= data[0].ingredients;

  for(var i=1; i< ings.length; i++){
    addIngredient();
  }

  var ingRows = document.getElementsByClassName('ingredient-row');

  
  for(var i=0; i< ingRows.length; i++){
    quantites.push(ings[i].quantite);
    ingRows[i].querySelector("#quantite").textContent= ings[i].quantite;
    ingRows[i].querySelector("#unite").textContent= ings[i].unite;
    ingRows[i].querySelector("#nom").textContent= ings[i].nom;
  } 
}


function editRecipe(){
  localStorage.setItem("titre",titre);
  localStorage.setItem("loadRecipe",true);
  loginAction="edit";
  openPopup();
}


function addIngredient(){
  console.log("add ingredient")
  var elem = document.getElementsByClassName('ingredient-row');
  // Create a copy of it
  var clone = elem[0].cloneNode(true);
  elem[elem.length-1].after(clone);

}
function timesOne(btn){

  btn.classList.add('active');
  document.getElementById("fois2").classList.remove('active');
  document.getElementById("multi-perso").classList.remove('active');
  var ingRows = document.getElementsByClassName('ingredient-row');
  for(var i=0; i< ingRows.length; i++){
    ingRows[i].querySelector("#quantite").textContent=quantites[i];
  }

}
function timesTwo(btn){

  btn.classList.add('active');
  document.getElementById("fois1").classList.remove('active');
  document.getElementById("multi-perso").classList.remove('active');

  var ingRows = document.getElementsByClassName('ingredient-row');
  for(var i=0; i< ingRows.length; i++){
    ingRows[i].querySelector("#quantite").textContent=2*quantites[i];
  }
}

function timesPerso(btn){

  btn.classList.add(' gactive');
  document.getElementById("fois1").classList.remove('active');
  document.getElementById("fois2").classList.remove('active');

}
function timesPersoChange(btn){
  const multi=btn.value;
  var ingRows = document.getElementsByClassName('ingredient-row');
  for(var i=0; i< ingRows.length; i++){
    ingRows[i].querySelector("#quantite").textContent=multi*quantites[i];
  }
}







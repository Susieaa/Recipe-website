

const supabaseUrl = "https://omatwecxigsncfpjtsoz.supabase.co";
const supabaseKey = "sb_publishable_c0FYjEy_ZM5yESU-zkbw4g_PbdPSVSw";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const authentified = false;
const deleteAction=false;
let loginAction=null;
let elemDelete=null;
document.addEventListener("DOMContentLoaded", async () => {
 
  loadRecipe();

  //si pas de ocnnection internet 
  if(!window.navigator.onLine){
    document.querySelector(".noConnection").style.display="flex";
    document.getElementById("container-fiches").style.display="none";
  }
});

// change in function of connection
window.addEventListener('online', () => {
    document.querySelector(".noConnection").style.display="none";
    document.getElementById("container-fiches").style.display="flex";
});

window.addEventListener('offline', () => {
    document.querySelector(".noConnection").style.display="flex";
    document.getElementById("container-fiches").style.display="none";
});

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 100|| document.documentElement.scrollTop > 100) {
    document.getElementById("button-header").style.display="flex";
  } else {
    document.getElementById("button-header").style.display="none";
  }
}


async function loadRecipe(){

  const { data, error } = await supabaseClient
  .from('recipes')
  .select();

  for(var i = 0; i < data.length; i++){
    const originalDiv = document.getElementsByClassName('fiche-recette')[0];
    const clonedDiv = originalDiv.cloneNode(true);
    clonedDiv.style.display="flex";
    clonedDiv.querySelector("#fiche-titre").textContent=data[i].titre;
    clonedDiv.querySelector("#fiche-temps").textContent=data[i].temps;
    clonedDiv.querySelector("#fiche-sucre").textContent=data[i].sucre;

    //load image
    var filePath=data[i].imageName;
    console.log
    const { data: dataImg } = supabaseClient
      .storage
      .from("recipe-images")
      .getPublicUrl(filePath);
    const imageUrl = dataImg.publicUrl;
    clonedDiv.querySelector("#fiche-img").src=imageUrl;

    originalDiv.after(clonedDiv)
  }
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


async function verifyLogin(){
  let authentified=await loginSupabase();
  console.log("authentified:",authentified);
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

function openRecipe(e){
  const titre=e.querySelector("#fiche-titre").textContent;
  localStorage.setItem("titre",titre);
  console.log("show");
  location.replace("./recipe.html");
}

function editRecipe(e){
  event.cancelBubble = true;
  if(event.stopPropagation) event.stopPropagation();
  const ficheRecette = e.closest('.fiche-recette');
  const titre = ficheRecette.querySelector("#fiche-titre").textContent;  
  localStorage.setItem("titre",titre);
  localStorage.setItem("loadRecipe",true);
  loginAction="edit";
  openPopup();
}

async function deleteRecipe(e){
  event.cancelBubble = true;
  if(event.stopPropagation) event.stopPropagation();
  loginAction="delete";
  elemDelete=e;
  openPopup();
  
}


function selectRecipe(selection){
  fiches=document.querySelectorAll(".fiche-recette");
  for(var i=0;i<fiches.length;i++){
    if(selection=="all" && fiches[i].querySelector("#fiche-sucre").textContent!="Nope"){
      fiches[i].style.display="flex";
    }
    else if (selection=="sucré"){
      if(fiches[i].querySelector("#fiche-sucre").textContent=="Sucré"){
        fiches[i].style.display="flex";
      }
      else{
        fiches[i].style.display="none";
      }
    }
    else if (selection=="salé"){
      if(fiches[i].querySelector("#fiche-sucre").textContent=="Salé"){
        fiches[i].style.display="flex";
      }
      else{
        fiches[i].style.display="none";
      }
    }
  }
}

//affiche les recettes en fonction de ce qui est tapé dans la search bar
function searchRecipe(){
  const searchValue=document.getElementById("searchBar").value.toLowerCase();
  fiches=document.querySelectorAll(".fiche-recette");
  for(var i=0;i<fiches.length;i++){
    const titre=fiches[i].querySelector("#fiche-titre").textContent.toLowerCase();
    if(titre.includes(searchValue) && titre!="boubiboulga"){
      fiches[i].style.display="flex";
    }
    else{
      fiches[i].style.display="none";
    }
  }
}


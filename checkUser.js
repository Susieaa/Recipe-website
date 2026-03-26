const supabaseUrl = "https://omatwecxigsncfpjtsoz.supabase.co";
const supabaseKey = "sb_publishable_c0FYjEy_ZM5yESU-zkbw4g_PbdPSVSw";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const load=localStorage.getItem("loadRecipe");
const titreRecette=localStorage.getItem("titre");
var saveEditMode=false;
var dataId="";

// Check for an active session when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (!session) {
      // No session? Redirect to login
      alert("You must be logged in to view this page.");
      location.replace("./index.html"); // Redirect to login page
  } else {
      // User is logged in, load the page content
      console.log("User is logged in:", session.user.email);
  }
   

    
    if(load=='true'){
      saveEditMode=true;
      localStorage.setItem("loadRecipe",false);
      loadRecipe(titreRecette);
    }
});


// Global declarations :

var imageName =""; //save the name of the image associated to the recipe to get it back later
var imageChoosen = false;
var nbIngre =1; //track the number of ingredients

function returnHomepage(){
  location.replace("./index.html") 
}

function openPopup(){
  const popup=document.getElementById("popup1");
  popup.classList.add("show");
  

}
function closePopup(){
  
  const popup=document.getElementById("popup1");
  popup.classList.remove("show");
}

function openAlert(message){
  const popup=document.getElementById("alertBlock");
  document.getElementById("alert-message").textContent=message;
  popup.classList.add("show");
}
function closeAlert(){
  const popup=document.getElementById("alertBlock");
  popup.classList.remove("show");
}

async function loadRecipe(titre){

  const { data, error } = await supabaseClient
  .from("recipes")
  .select("*")
  .eq("titre", titre);
  dataId=data.id;
  console.log("loading recipe");
  document.getElementById("inputTitle").value=data[0].titre;
  document.getElementById("inputEtapes").value=data[0].etapes;
    document.getElementById("inputNotes").value=data[0].notes;
  document.querySelector(".btnText").textContent=data[0].sucre;
  document.getElementById("cuisson").value=data[0].cuisson;
  document.getElementById("temps").value=data[0].temps;
  document.getElementById("inputPersonnes").value=data[0].parts;
  imageName=data[0].imageName;
  console.log("image name:",imageName);
  //load ingredients
  const ings= data[0].ingredients;

  for(var i=1; i< ings.length; i++){
    addIngredient();
  }
  var ingRows = document.getElementsByClassName('ingredient-row');
  console.log(ingRows[0].getElementsByClassName("quantite"));
  
  for(var i=0; i< ingRows.length; i++){
    ingRows[i].getElementsByClassName("quantite")[0].value= ings[i].quantite;
    ingRows[i].getElementsByClassName("unite")[0].value= ings[i].unite;
    ingRows[i].getElementsByClassName("ingredient-name")[0].value= ings[i].nom;
  }


  //load image
  var filePath=data[0].imageName;
  console.log("file path:",filePath);
  const { data: dataImg } = supabaseClient
    .storage
    .from("recipe-images")
    .getPublicUrl(filePath);
  const imageUrl = dataImg.publicUrl;
  console.log("image url:",imageUrl);
  
  const fileInput = document.getElementById("imageRecette");
  const file = fileInput.files[0];
  const image = document.createElement("img");
  image.setAttribute('id',"imagePreview")
  image.src = imageUrl;
  fileInput.after(image);
  firstImage=true;
 
}

function addIngredient(){
  console.log("add ingredient")
  var elem = document.getElementsByClassName('ingredient-row');
  nbIngre++;
  // Create a copy of it
  var clone = elem[0].cloneNode(true);
  clone.getElementsByClassName("quantite")[0].value="";
  clone.getElementsByClassName("unite")[0].value="";
   clone.getElementsByClassName("ingredient-name")[0].value="";
  console.log(clone.getElementsByClassName("quantite")[0].value);

  elem[elem.length-1].after(clone);

}

function removeIngredient(e){
  if(nbIngre==1){
    openAlert("Tu peux pas tout enlever non plus");
    return;
  }
  nbIngre=nbIngre-1;
  console.log("remove");
  e.parentNode.parentNode.removeChild(e.parentNode);
}

var firstImage=false;
function showImage(){
  const fileInput = document.getElementById("imageRecette");
  const file = fileInput.files[0];
 

  if(file){
    if(!firstImage){
      const image = document.createElement("img");
      image.setAttribute('id',"imagePreview")
      image.src = URL.createObjectURL(file);
      fileInput.after(image);
      firstImage=true;
    }
    else{
      document.getElementById("imagePreview").src=URL.createObjectURL(file);
    }
    imageChoosen=true; // need to change to false if image remover option
  }
  else{
    alert("No file selected");
  }
}
var sucreValue="";
function putSucre(e){
  
  console.log( );
  document.querySelector(".btnText").textContent=e.innerHTML;
  sucreValue=e.innerHTML;
  hideDropdownSucre();
  document.getElementById("drop").style.transform="none";
  dropSucre=false;
}

var dropSucre=false;
function dropdownSucre(){
  if(dropSucre){
    hideDropdownSucre();
    document.getElementById("drop").style.transform="none";
  }
  else{
    showDropdownSucre();
    document.getElementById("drop").style.transform="rotate(180deg)";
  }
  dropSucre=!dropSucre;
}

function showDropdownSucre(){
  document.getElementById("dropdownSucre").style.display="block";
}

function hideDropdownSucre(){
  document.getElementById("dropdownSucre").style.display="none";
}


async function imageUpload() {
  const fileInput = document.getElementById("imageRecette");
  const file = fileInput.files[0];
  var filePath=imageName; 
  if (!file) {
      openAlert("Pas d'image sélectionnée");
      return;
  }
  if(saveEditMode){
    console.log("file path for edit:",filePath);
    const { data: { user } } = await supabaseClient.auth.getUser();
   
    // Supprime l'ancienne image
    const { error: removeError } = await supabaseClient.storage
      .from("recipe-images")
      .remove([filePath]);

    if (removeError) {
      console.error("Erreur lors de la suppression :", removeError.message);
      openAlert("Je n'ai pas réussi à supprimer l'ancienne image");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    filePath = fileName; 
    // Upload la nouvelle image
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("recipe-images")
       .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
      });

    if (uploadError) {
      console.error("Erreur lors de l'upload :", uploadError.message);
      openAlert("Je n'ai pas réussi à uploader ton image");
      return;
    }

    console.log("Image remplacée avec succès :", uploadData);

  }
  else{
  // Create unique filename (very important to avoid overwriting)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName; //`recipes/${fileName}`; folder inside bucket (optional)
    
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log(user);
    const { data, error } = await supabaseClient.storage
        .from("recipe-images")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        console.error("Upload error:", error.message);
        openAlert("J'ai pas réussi à prendre ton image");
        return;
    }

    console.log("File uploaded:", data);
  }
   
  return filePath; // Return the file path to save in the database
}




async function saveRecette(){
  console.log("save");
  
  //Then save all the text too
  const title=document.getElementById("inputTitle").value;

  const etapes=document.getElementById("inputEtapes").value;
  const cuisson=document.getElementById("cuisson").value;
  const notes=document.getElementById("inputNotes").value;
  
  console.log("still in it");
  const temps=document.getElementById("temps").value;
  const parts=document.getElementById("inputPersonnes").value;
  sucreValue=document.querySelector(".btnText").textContent;

  var quantites = document.querySelectorAll('.quantite');
  var unites = document.querySelectorAll('.unite');
  var ingredients = document.querySelectorAll('.ingredient-name');
  let ing=[];
  for(var i = 0; i < quantites.length; i++){
    var qt = quantites[i].value;
    var ut = unites[i].value;
    var ig = ingredients[i].value;

    //check if some field missing
    if(qt==""||ut==""||ig==""){
      openAlert("Remplis bien tous les ingrédients")
      return;
    }
    ing.push({quantite: qt, unite: ut, nom: ig })
  }
  console.log(ing.length);
  console.log(ing);
  // check if required value missing :
  if(title=="" ||sucreValue==""){
    openAlert("Oublie pas d'éléments (titre, sucré/salé)");
    return;
  }
  //if an image has been uploaded -> upload the image to supabase
  if(imageChoosen){
    imageName= await imageUpload(); 
  }
  console.log("image name:",imageName);
  console.log(imageChoosen);


  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError) {
    console.error(userError);
    return;
  }

  
  
  if(saveEditMode){
    const { data , error } = await supabaseClient
    .from("recipes")
    .select("*")
    .eq("titre", titreRecette)
    .single(); // Use .single() to get a single object

    if (error) {
      console.error("Error fetching recipe:", error);
      return;
    }

    if (data) {
      dataId = data.id; // Assign the id to dataId
      console.log("Recipe ID for editing:", dataId);
    } else {
      console.error("Recipe not found");
    }
    
    console.log("update existing recipe");
    const { data : dat, error :err} = await supabaseClient
    .from("recipes")
    .update({
      titre:title,
      ingredients: ing,
      etapes: etapes,
      imageName: imageName,
      cuisson: cuisson,
      temps: temps,
      sucre: sucreValue,
      parts:parts,
      notes:notes,
      user_id: user.id,
      
    })
    .eq("id", dataId);
  }
  else{
  const { data, error } = await supabaseClient
    .from("recipes")
    .insert([ 
      {
        titre: title,
        ingredients: ing,
        etapes: etapes,
        imageName: imageName,
        cuisson :cuisson,
        temps: temps,
        sucre:sucreValue,
        user_id: user.id,
      }
    ]);
  }

  console.log("Recipe added!");
  localStorage.setItem("createRecipe",true);
  openPopup();

  

}


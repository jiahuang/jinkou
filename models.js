function defineModels(mongoose, fn){
  var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

  var Photo = new Schema({
    'image': String,
    'caption': String,
    'lat': Number,
    'long': Number,
    'takenDate': Date,
    'addDate':{ type: Date, default: Date.now }
  });

  function validatePresenceOf(value) {
    return value && value.length;
  }
  
  var User = new Schema({
    'name'  : { type: String },
    'email' : {type:String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true }} ,
    'pw'  : String, 
    'registrationDate' : { type: Date, default: Date.now },
    'views' : { type: Number, index: true },
    'photos': [Photo]
  });
  
  //mongoose.model('Photo', Photo);
  mongoose.model('User', User);
  
  fn();
}

exports.defineModels = defineModels; 

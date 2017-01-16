import stampit from 'stampit'

// setting some default values for the app
const defaults = stampit().refs({
  name : 'DIL',
  homePageConfig : {
    locateText : "Enter the city to search hotels"
  }
});
/*
	newAuthor : type object {name : 'Gurminder'}
 */
// methods attached on main app object
const systemEdit = stampit({
  methods: {
    addAuthor(newAuthor) {
      this.authors[newAuthor.name] = newAuthor;
      return this;
    },
    getAuthor(name) {
      return this.authors[name];
    },
    getAllAuthors() {
      return this.authors;
    }
  },
  refs: {
    authors: {}
  }
});


const SelfAware = stampit.init(({ instance, stamp }) => {
  if (!stamp.fixed.methods.getStamp) { // Avoid adding the same method to the prototype twice.
    stamp.fixed.methods.getStamp = () => stamp;
  }
});


const appObject = stampit.compose(SelfAware,defaults, systemEdit);
const appObjectInstance = appObject({name : 'DoItLoud'});
//adding me as a author
appObjectInstance.addAuthor({
	name : 'Gurminder'
});
export default appObjectInstance;
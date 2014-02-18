var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Updates', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      
      
      store.Model('User', function(){
        this.hasMany('posts');
        this.hasMany('threads');
      
        this.beforeUpdate(function(){
          this.save.should.be.a.Function;
          return this.login != 'max';
        });
      
        this.beforeUpdate(function(){
          this.save.should.be.a.Function;
          return this.login != 'maxi';
        });
      
        this.beforeSave(function(){
          this.save.should.be.a.Function;
          return this.login != '_max';
        });
      
        this.afterSave(function(){
          this.save.should.be.a.Function;
          return this.login != '_maxi';
        });  
      
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread');
      
        this.validatesPresenceOf('message');
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts');
      });
    });
    
    
    
    describe('beforeUpdate()', function(){
      it('gets called', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login = 'max';
            phil.save(function(result){
              result.should.be.false;
              next();
            });
          });      
        });
      });
    });
  
  
    describe('afterUpdate()', function(){
      it('gets called', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login = 'maxi';
            phil.save(function(result){
              result.should.be.false;
            
              User.where({login:'maxi'}).count().exec(function(result){
                result.count.should.be.equal(0);
                next();
              });
            
            });
          });      
        });
      });
    });
  
   
    describe('beforeSave()', function(){
      it('gets called', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login = '_max';
            phil.save(function(result){
              result.should.be.false;
              next();
            });
          });      
        });
      });
    });
  
 
    describe('afterSave()', function(){
      it('gets called', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login = '_maxi';
            phil.save(function(result){
              result.should.be.false;
            
              User.where({login:'_maxi'}).count().exec(function(result){
                result.count.should.be.equal(0);
                next();
              });
            
            });
          });      
        });
      });
    });
  
  
  
  
    describe('update()', function(){
    
      it('updates a single record', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login.should.be.equal('phil');
          
            phil.login = 'philipp';
            phil.save(function(result){
              result.should.be.equal(true);
            
              User.where({login:'philipp'}).limit(1).exec(function(philipp){
                philipp.login.should.be.equal('philipp');
                philipp.id.should.be.equal(phil.id);
                next();
              });            
            
            });
          
          });  
        });
      });
    
    
    
      it('updates a single record and set a value to null', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(3, function(admin){
            admin.login.should.be.equal('admin');
          
            admin.login = 'administrator';
            admin.email = null
            admin.save(function(result){
              result.should.be.equal(true);
            
              User.where({login:'administrator'}).limit(1).exec(function(administrator){
                administrator.login.should.be.equal('administrator');
                administrator.id.should.be.equal(admin.id);
                should.not.exist(administrator.email);
                next();
              });            
            
            });
          
          });  
        });
      });
    
    
    
      it('updates a nested records', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(2).include('posts').exec(function(michl){
            michl.login.should.be.equal('michl');
            michl.posts.length.should.be.equal(1);
            michl.posts[0].message.should.be.equal('michls post');
          
            michl.login = 'michael';
            michl.posts[0].message = 'michaels post';
          
            michl.posts[0].__exists.should.be.true;
          
            michl.save(function(result){
              result.should.be.equal(true);
            
              User.where({login:'michael'}).include('posts').limit(1).exec(function(michael){
                michael.login.should.be.equal('michael');
                michael.id.should.be.equal(michl.id);
                michael.posts[0].message.should.be.equal('michaels post');
                michael.posts[0].id.should.be.equal(michl.posts[0].id);
                michael.posts.length.should.be.equal(1);
                next();
              });            
            
            });
          
          });  
        });
      });
      
      
      it('create only nested record', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Post = store.Model('Post');
          User.find(3).include('posts').exec(function(admin){
            admin.posts.length.should.be.equal(0);
          
            admin.posts.add({thread_id:4, message: 'admin was here'});
                    
            admin.save(function(result){
              result.should.be.equal(true);
            
              Post.where({user_id:3}).count().exec(function(result){
                result.count.should.be.equal(1);
                next();
              });            
            
            });
          
          });  
        });
      });
    
    
    
    
    
      it('updates a record and adds new nested records', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.find(1).include('posts').exec(function(thread){
            thread.title.should.be.equal('first thread');
            thread.posts.length.should.be.equal(3);
          
            thread.title = 'Phils first thread';
            thread.posts.add({user_id: 1, message:'another post'});
            thread.posts.add({user_id: 2, message:'one more'});
          
            thread.save(function(result){
              result.should.be.equal(true);
            
              Thread.find(1).include('posts').exec(function(michael){
                thread.title.should.be.equal('Phils first thread');
                thread.posts.length.should.be.equal(5);
              
                next();
              });            
            
            });
          
          });  
        });
      });
             
    });
    
    
  });
};
let lib = require('./dist/index');

let config  = {
  min : 3,
  max : 10,
  waitingTimeOut : 50,
  maxWaitingClients : 8,
  destroyIdleAfter : 10000
};

let methods = {
  create : function(listener) {
    setTimeout(function(){
      listener(new Object());
    }, 10);
  },

  destroy : function(item) {

  }
};

let pool = new lib.EasyPool(methods, config);

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 20000);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 2000);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 500);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 2200);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 200);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 30);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 16000);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 16000);
}, error => {
  console.dir(error);
});

pool.acquire(item => {
  setTimeout( () => {
    pool.release(item);
  }, 16000);
}, error => {
  console.dir(error);
});

setTimeout(() => {
  pool.acquire(item => {
    setTimeout( () => {
      pool.release(item);
    }, 1600);
  }, error => {
    console.dir(error);
  });
}, 500);


setTimeout(() => {
  pool.acquire(item => {
    setTimeout( () => {
      pool.release(item);
    }, 20000);
  }, error => {
    console.dir(error);
  });
}, 600);

setTimeout(()=>{}, 30000);
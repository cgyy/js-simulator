var jssim = jssim || {};

(function(jss){
    jss.exchange = function (a, i, j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    };
    
    jss.shuffle = function(a) {
        var n = a.length;
        for(var i = 1; i < n; ++i) {
            var j = Math.floor(Math.random() * (1+i));
            jss.exchange(a, i, j);
        }
    };
	
    var MinPQ = function (compare) {
        if(!compare){
            compare = function(a1, a2) {
                return a1 - a2;
            };
        }
        this.s = [];
        this.N = 0;
        this.compare = compare;
    };
    
    MinPQ.prototype.less = function (a1, a2){
        return this.compare(a1, a2) < 0;
    };
    
    MinPQ.prototype.enqueue = function (item) {
        while(this.s.length <= this.N + 1){
            this.s.push(0);
        }  
        this.s[++this.N] = item;
        this.swim(this.N);
    };
    
    MinPQ.prototype.delMin = function () {
        if(this.N == 0) {
            return null;
        }  
        
        var item = this.s[1];
        jss.exchange(this.s, 1, this.N--);
        this.sink(1);
        return item;
    };
    
    MinPQ.prototype.min = function() {
        if(this.N == 0) {
            return null;
        }  
        return this.s[1];
    };
    
    MinPQ.prototype.sink = function (k) {
        while(k * 2 <= this.N) {
            var child = k * 2;
            if (child < this.N && this.less(this.s[child+1], this.s[child])){
                child++;
            }
            if(this.less(this.s[child], this.s[k])){
                jss.exchange(this.s, child, k);
                k = child;
            } else {
                break;
            }
        }  
    };
    
    MinPQ.prototype.swim = function (k) {
        while(k > 1) {
            var parent = Math.floor(k / 2);
            if(this.less(this.s[k], this.s[parent])) {
                jss.exchange(this.s, k, parent);
                k = parent;
            } else {
                break;
            }
        }  
    };
    
    MinPQ.prototype.clear = function() {
        this.s = [];
        this.N = 0;
    };
    
    MinPQ.prototype.size = function() {
        return this.N;
    };
    
    MinPQ.prototype.isEmpty = function() {
        return this.N == 0;
    };
    
    jss.MinPQ = MinPQ;
    
    var SimEvent = function (time, rank){
        this.time = time;
        if(rank){
            this.rank = rank;
        } else {
            this.rank = 1;
        }
        if(this.rank < 1) {
            this.rank = 1;
        }
    };
    
    var Scheduler = function() {
        this.pq = new jss.MinPQ(function(evt1, evt2){
            var time_diff = evt1.time - evt2.time;
            if(time_diff == 0) {
                return evt2.rank - evt1.rank;
            } else {
                return time_diff;
            }
        });  
        this.current_time = null;
        this.current_rank = null;
    };
    
    Scheduler.prototype.update = function() {
        var current_time = null;
        var current_rank = null;
        var events = [];
        while(!this.pq.isEmpty()){
            var evt = this.pq.min();
            var time = evt.time;
            var rank = evt.rank;
            if(current_time == null) {
                current_time = time;
            } else if(current_time != time) {
                break;
            }
            
            if(current_rank == null) {
                current_rank = rank;
            } else if(current_rank != rank) {
                break;
            }
            
            events.push(this.pq.delMin());
        }  
        
        jss.shuffle(events);
        
        for(var i = 0; i < events.length; ++i){
            var deltaTime = 0;
            if(this.current_time != null) {
                deltaTime = current_time - this.current_time;
            } else {
                deltaTime = current_time;
            }
            events[i].update(deltaTime);
        }
        
        if(events.length > 0){
            this.current_time = current_time;
            this.current_rank = current_rank;
        } 
        
        return events;
    };
    
    Scheduler.prototype.schedule = function(evt) {
        this.pq.enqueue(evt);  
    };
    
    Scheduler.prototype.hasEvents = function() {
        return !this.pq.isEmpty();  
    };
    
    jss.SimEvent = SimEvent;
    jss.Scheduler = Scheduler;

})(jssim);

var module = module || {};
if(module) {
	module.exports = jssim;
}
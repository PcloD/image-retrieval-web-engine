var myApp = angular.module('myApp', ["ngRoute"]);

myApp.controller('mainCtrl', function($scope){
    $scope.selectedA = "selected";
    $scope.selectedB = "";
    $scope.selectedC = "";
    $scope.selectedD = "";
    $scope.info = "image-info";
    
    $scope.deselectAll = function(){
        $scope.selectedA = "";
        $scope.selectedB = "";
        $scope.selectedD = "";
    }
    
    $scope.clickC = function(){
        if($scope.explore_var){
            $scope.selectedC = "selected";
        }else{
            $scope.selectedC = "";
        }
        
    }
})

myApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "list_images.htm"
    })
    .when("/search", {
        templateUrl : "search.htm"
    });
    /*.when("/upload", {
        templateUrl : "upload.htm"
    });*/
});

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(obj, uploadUrl, $scope){
        var fd = new FormData();
        for(key in obj){
            fd.append(key, obj[key]);
        }
        fd.append('quote', "");
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response) {
            $scope.callBack(response);
    });
    }
}]);

myApp.controller('myCtrl', ['$scope', 'fileUpload', '$rootScope', function($scope, fileUpload, $rootScope){
    
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        var title = $scope.myTitle;
        var obj = {image:file, title:title};
        console.log('file is ' );
        console.dir(file);
        var uploadUrl = "/api/image_upload/";
        fileUpload.uploadFileToUrl(obj, uploadUrl, $scope);
    };
    
    
    
    $scope.callBack = function(response){
            $scope.done = response.data;
            console.log("calling back");
            console.log($scope.done)
            $rootScope.$emit("Explore", $scope.done.pk);
    }
    
}]);

myApp.controller('queryCtrl', ['$scope', 'fileUpload', '$http', function($scope, fileUpload, $http){
    
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        var obj = {myfile:file};
        console.log('file is ' );
        console.dir(file);
        var uploadUrl = "/api/query_up/";
        fileUpload.uploadFileToUrl(obj, uploadUrl, $scope);
    };
    
    $scope.callBack = function(response){
        console.log("getting resources");
        $scope.done = response.data;
        console.log($scope.done);
        $http.get("/api/query_get/" + $scope.done + "/" + "?page=" + $scope.pages.current, {cache: true}).then(function(response){
        $scope.imageList = response.data.results;
        console.log($scope.imageList);
        $scope.searching = true;
        $scope.pages.key = $scope.done;
            
        if(response.data.total_pages > 1){
            $scope.pages.last = response.data.total_pages;
            $scope.pages.next = $scope.pages.current + 1;
        }
        
            $scope.pages.previous = $scope.pages.current - 1;    
            
        }, function(response){
    });
    }
    
        $scope.explore = function(key){
        console.log("exploring ");
        console.log(key);
        $http.get("/api/explore/" + key + "/" + "?page=" + $scope.pages.current, {cache: true}).then(function(response){
        $scope.imageList = response.data.results;
        console.log($scope.imageList);
        $scope.exploring = true;
        $scope.pages.key = key;
            
        if(response.data.total_pages > 1){
            $scope.pages.last = response.data.total_pages;
            $scope.pages.next = $scope.pages.current + 1;
        }else{
            $scope.pages.last = null;
            $scope.pages.next = null;
        }
        
            $scope.pages.previous = $scope.pages.current - 1; 
            
            
            
            
    }, function(response){
    });
    }
    
    $scope.pages = {  
        current:1,
        next:null,
        last:null,
        previous:null,
        key:null
    };
    
    $scope.nextPage = function(){
        if($scope.pages.current < $scope.pages.last){
            $scope.pages.current += 1;
            $scope.pages.previous += 1;
            if(typeof $scope.pages.key == "string"){
                $scope.callBack({data:$scope.pages.key})
            }else{
                $scope.explore($scope.pages.key)
            }
        }
    }
    
    $scope.previousPage = function(){
        if($scope.pages.current > 1){
            $scope.pages.current -= 1;
            $scope.pages.previous -= 1;
             if(typeof $scope.pages.key == "string"){
                $scope.callBack({data:$scope.pages.key})
            }else{
                $scope.explore($scope.pages.key)
            }
        }
    }
    
    
}]);




//Image List Controller
myApp.controller('listCtrl', ['$scope', '$http', '$rootScope', '$window', function($scope, $http, $rootScope, $window){
    
    $scope.openInNewTab = function(link){
        console.log("open in new tab");
        $window.open(link, '_blank');
    }
    
    $scope.reload = function(){
        $window.location.reload();

    }
    
    $http.get("/api/image_list/", {cache: true}).then(function(response){
        console.log("image_list")
        $scope.imageList = response.data.results;
        
    }, function(response){
    })
    
    $rootScope.$on("Explore", function(event, data){
        console.log("i'm on air");
        console.log(data);
        $scope.explore(data);
    });    

    
    $scope.explore = function(key){
        console.log("exploring ");
        console.log(key);
        $http.get("/api/explore/" + key + "/" + "?page=" + $scope.pages.current, {cache: true}).then(function(response){
        $scope.imageList = response.data.results;
        console.log($scope.imageList);
        $scope.exploring = true;
        $scope.pages.key = key;
            
        if(response.data.total_pages > 1){
            $scope.pages.last = response.data.total_pages;
            $scope.pages.next = $scope.pages.current + 1;
        }
        
            $scope.pages.previous = $scope.pages.current - 1; 
        
            
            
            
    }, function(response){
    });
    }
    
    $scope.pages = {  
        current:1,
        next:null,
        last:null,
        previous:null,
        key:null
    };
    
    $scope.nextPage = function(){
        if($scope.pages.current < $scope.pages.last){
            $scope.pages.current += 1;
            $scope.pages.previous += 1;
            $scope.explore($scope.pages.key)
        }
    }
    
    $scope.previousPage = function(){
        if($scope.pages.current > 1){
            $scope.pages.current -= 1;
            $scope.pages.previous -= 1;
            $scope.explore($scope.pages.key)
        }
    }
    
    
    

}])


































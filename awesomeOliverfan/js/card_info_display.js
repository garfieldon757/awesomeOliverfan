

window.onload =function(){

    var historyItemArray_map = {};

    function drawChart(data_json)
    {
        console.log(data_json);
        var mind = {
            /* 元数据，定义思维导图的名称、作者、版本等信息 */
            "meta":{
                "name":"jsMind-demo-tree",
                "author":"hizzgdev@163.com",
                "version":"0.2"
            },
            /* 数据格式声明 */
            "format":"node_tree",
            /* 数据内容 */
            "data": data_json
        };

        var options = {
            container:'jsmind_container',
            editable:true,
            theme:'orange'
        };

        var jm = new jsMind(options);
        // 让 jm 显示这个 mind 即可
        jm.show(mind); 
    }
    
    function get_whole_historyList(hookFunction){
        
        chrome.history.search({
            text: '',
            startTime: new Date().getTime() - 24*3600*3600,
            endTime: new Date().getTime(),
            maxResults: 20
            }, function(historyItemArray){
                
                var whole_historyList_length = historyItemArray.length;

                var callbackFun_index = 0;
                for(var i=0; i<whole_historyList_length; i++)
                {
                    historyItemArray[i].isVisited = 0;// 每条历史记录对象增加了“是否访问”的标志位，并初始化

                    chrome.history.getVisits({
                        url: historyItemArray[i].url
                        }, function(visitItemArray){//这里是回调函数，所以需要单独建立index
                            var visitItem = visitItemArray[0];
                            historyItemArray[callbackFun_index].visitId = visitItem.visitId;
                            historyItemArray[callbackFun_index].visitTime = visitItem.visitTime;
                            historyItemArray[callbackFun_index].referringVisitId = visitItem.referringVisitId;
                            historyItemArray[callbackFun_index].transition = visitItem.transition;
                            callbackFun_index++;
                            
                            if(callbackFun_index == whole_historyList_length)
                            {
                                hookFunction(historyItemArray);
                             }
                        });
                }
                
                return historyItemArray;
                
            });

    }//得到列表并给每一个对象增加一个标志为（isVisited）


    function historyTree_recursive(historyItemArray, referringVisitId){
        
        
        var children_node_list = [];
        for(var i=0; i<historyItemArray.length; i++)
        {   
            if(historyItemArray[i].visitId == 72)
                {alert("weibo page!!!");}//??????????????

            if(     historyItemArray[i].isVisited        == 0 
                &&  historyItemArray[i].referringVisitId == referringVisitId )
            {
                
                historyItemArray[i].isVisited = 1;
                //向canvs的node中传递属性之
                var children_node = {};
                children_node["id"] = historyItemArray[i].id;
                children_node["topic"] = historyItemArray[i].title;
                children_node["children"] = [];
                historyTree_recursive(historyItemArray, historyItemArray[i].visitId );//递归 DFS
                children_node_list.push(children_node);
            }
        }

        return children_node_list;
        
    }


    function modify_historyItemArray(historyItemArray)
    {
        var root_node = {};
        root_node["id"] = "id0";
        root_node["topic"] = "root";
        root_node["children"] = historyTree_recursive(historyItemArray, "0");

        historyItemArray_map = root_node;

        var data_json = JSON.stringify(historyItemArray_map);
        console.log("--------");
        //drawChart(data_json);
        console.log(historyItemArray);

    }

    


    
    
    var historyItemArray =  get_whole_historyList(modify_historyItemArray);//获取整个历史纪录对象列表,并递归dfs

    
    
    // var historyItemArray_node_json = JSON.stringify(historyItemArray_node);//js对象json化                  

    
    
    
    
    

}
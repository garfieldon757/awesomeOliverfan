

window.onload =function(){

    var historyItemArray_map = {};
    var historyItemArray =  get_whole_historyList(modify_historyItemArray);//获取整个历史纪录对象列表,并递归dfs  
    
    
    function get_whole_historyList(hookFunction){
        
        chrome.history.search({
            text: '',
            startTime: new Date().getTime() - 24*3600*3600,
            endTime: new Date().getTime(),
            maxResults: 50
            }, function(historyItemArray){
                
                var whole_historyList_length = historyItemArray.length;

                /**chrome.history.getVisits()函数里第二个参数是回调函数，由于js异步执行的机制，为了
                  *在循环运行结束后使用回调函数的操作结果，在回调函数外部，声明了一个callbackFun_index   
                  *索引。
                **/
                var callbackFun_index = 0;
                for(var i=0; i<whole_historyList_length; i++)
                {
                    // 每个标签记录对象增加了“是否访问”的标志位，并初始化
                    historyItemArray[i].isVisited = 0;

                    chrome.history.getVisits({
                        url: historyItemArray[i].url
                        }, function(visitItemArray){
                            //每条标签对象增加了visitItemArray拥有的几条属性值
                            var visitItem = visitItemArray[0];
                            historyItemArray[callbackFun_index].visitId = visitItem.visitId;
                            historyItemArray[callbackFun_index].visitTime = visitItem.visitTime;
                            historyItemArray[callbackFun_index].referringVisitId = visitItem.referringVisitId;
                            historyItemArray[callbackFun_index].transition = visitItem.transition;
                            callbackFun_index++;
                            
                            //当全部初始化操作完成后，调用钩子函数
                            if(callbackFun_index == whole_historyList_length)
                            {
                                hookFunction(historyItemArray);
                            }
                    });
                }
                
                return historyItemArray;
                
            });

    }

    function modify_historyItemArray(historyItemArray)
    {
        //建立所有标签页对象的跟节点，并调用递归函数
        var root_node = {};
        root_node["id"] = "id0";
        root_node["topic"] = "root";
        root_node["children"] = historyTree_recursive(historyItemArray, "0");

        //historyItemArray_map使全局变量，该指针来指向整个标签页列表
        historyItemArray_map = root_node;

        //调整好的标签对象列表转成json字符串，作为参数传给画图函数进行导图绘制
        var data_str = JSON.stringify(historyItemArray_map);
        drawChart(data_str);

    }


    function historyTree_recursive(historyItemArray, referringVisitId){
        
        //为了生成json格式的data数据进行画图，这里使用DFS方式进行递归调用
        var children_node_list = [];
        for(var i=0; i<historyItemArray.length; i++)
        {   
            //有潜在的递归问题待解决。。。

            if(     historyItemArray[i].isVisited        == 0 
                &&  historyItemArray[i].referringVisitId == referringVisitId )
            {
                
                historyItemArray[i].isVisited = 1;
                
                var children_node = {};
                children_node["id"] = historyItemArray[i].id;
                children_node["topic"] = historyItemArray[i].title;
                children_node["children"] = historyTree_recursive(historyItemArray, historyItemArray[i].visitId );//递归 DFS
                children_node_list.push(children_node);
            }
        }

        return children_node_list;
        
    }

    function drawChart(data_str)
    {
        //mind对象中的data属性接收object对象，所以需要将string先转换成object对象
        var data_json = JSON.parse(data_str);

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
        jm.show(mind); 
    }
             
    

}
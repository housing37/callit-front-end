/* ===================================================== */
/* NETWORK REQUEST SUPPORT */
/* ===================================================== */
// netowwork request endpoints
var FILE_NAME_RESULTS_EXPORT = "gtires_results_export"
//var API_VER = "/gasptires/api/v1"
var API_VER = "/gmsserv/api/v1"
var LOCAL_SERVER_URI    = "http://localhost:5001"       +API_VER
var REMOTE_SERVER_URI   = "http://3.16.26.237:50040"   +API_VER
var USE_LOCAL_SERVER = false
if (USE_LOCAL_SERVER == true) {
    // key_vals={'event_code', 'event_level', 'event_descr'}
    CALLIT_ADD_MARK = LOCAL_SERVER_URI+"/callit/market/add_v1";

    // key_vals={'get_all', 'get_date'} _ note_112623: 'get_all' default false client side
    // GET_AVM_LOG = LOCAL_SERVER_URI+"/avm/log/get_v1";
} else {
    // key_vals={'event_code', 'event_level', 'event_descr'}
    CALLIT_ADD_MARK = REMOTE_SERVER_URI+"/callit/market/add_v1";
}

$(document).ready(function() {
    $('#connect-wallet').click(function() {
        alert('Connect Wallet button clicked');
    });

    $('#ctx-sell').click(function() {
        const ctxAddr = $('#ctx-addr').val();
        alert('CTX Sell button clicked with address: ' + ctxAddr);
    });

    $('#submit-market').click(function() {
        const usdLpAmount = $('#usd-lp-amount').val();
        const description = $('#description-rules').val();
        const img_url = $('#market-img-url').val();
        const category = $('#market-category').val();
        
        const dt_trade_end = $('#input_dt_trade_end').val();
        if (dt_trade_end.length < 1) {
            alert("please select a date to search or click 'next' to search today")
            return
        }
        dt_trade_end = parse_date_picker_selection(dt_trade_end)

        let outcomes = [];
        $('.outcome-pair').each(function() {
            const label = $(this).find('.outcome-label').val();
            const desc = $(this).find('.outcome-desc').val();
            outcomes.push({label: label, desc: desc});
        });
        alert('Market submitted with outcomes: ' + JSON.stringify(outcomes));

        reqURL = CALLIT_ADD_MARK
        dictReqKeyVals = {"user_id": -37, "get_date":dt_updated, "cnt_evt_type":cnt_evt_type, "get_all":get_all}
        //alert(JSON.stringify(dictReqKeyVals))
                                
        // note_070922: exe network request after sleep 1 second
        //  ensure that 'query_results_head' text is updated on mobile
        //   local & remote server (from desktop) worked just fine
        //   but remote server from mobile, requires this 1 secon delay for DOM to render, i guess
        //ref: https://stackoverflow.com/a/1141340
        $('#query_results_head').text('Query In Progress... please wait')
        setTimeout(function(){
            exe_server_request(reqURL, dictReqKeyVals, handle_server_response, 'POST')
        }, 1000);
    });

    $('#buy-ctx').click(function() {
        const buyCtxAddr = $('#buy-ctx-addr').val();
        const buyCtxAmount = $('#buy-ctx-amount').val();
        alert('Buy CTX clicked with address: ' + buyCtxAddr + ' and amount: ' + buyCtxAmount);
    });

    $('.buy').click(function() {
        alert('Buy button clicked');
    });

    $('.sell').click(function() {
        alert('Sell button clicked');
    });

    $('#add-outcome').click(function() {
        $('#outcomes').append(`
            <div class="outcome-pair">
                <input type="text" class="outcome-label" placeholder="Label (ex: Another outcome)" style="width: 20%;">
                <input type="text" class="outcome-desc" placeholder="Description" style="width: 75%;">
            </div>
        `);
    });
});

function parse_date_picker_selection(sel_val) {
    //var dt = $('#input_query_date').val();
    var dt = sel_val;
    console.log("parse_date_picker_selection _ dt (pre-format): "+ dt)

    //replace all delimiters '-' to '/' (for cross broswer compatability)
    //  ref: https://stackoverflow.com/a/6714233
    dt = dt.replaceAll('-','/')
    console.log("dt (replace-format): "+ dt)
    
    //convert date format to year first (server side required)
    //  ref: https://stackoverflow.com/a/32348587
    var d = new Date(dt)
    var dt = d.getDate()
    var mm = d.getMonth() + 1
    var yyyy = d.getFullYear()
    dt = yyyy+"/"+mm+"/"+dt
    console.log("returning dt (ordered-format): "+ dt)
    return dt
}

/* ===================================================== */
/* NETWORK REQUEST SUPPORT */
/* ===================================================== */
function handle_server_response(reqURL, arr_dics) {
    //console.log("arr_dics: "+JSON.stringify(arr_dics))
    d_evt = arr_dics[0]
    RESP_CNT_EVT_TYPE = d_evt['input_cnt_evt_type']
    RESP_EVT_TYPE_CNT_TOT = d_evt['evt_type_cnt_tot']
    RESP_EVT_TYPE_CNT = d_evt['evt_type_cnt']
    
    $.each(arr_dics, function(x){
        d = arr_dics[x]
        if ('dt_created' in d) {
            //convert epoch time to string date & remove time part
            var epochDate = new Date(d['dt_created']*1000);
           //var strDate = epochDate.toLocaleString(); // returns same as 'localDate'
           var localDate = epochDate.toLocaleString("en-US", {timeZone: "America/New_York"}) //6/27/2021,
           d['dt_created'] = localDate
        }
        if ('dt_updated' in d) {
            //convert epoch time to string date & remove time part
            var epochDate = new Date(d['dt_updated']*1000);
            //var strDate = epochDate.toLocaleString().split(',')[0];
            //d['dt_updated'] = strDate
            var localDate = epochDate.toLocaleString("en-US", {timeZone: "America/New_York"}) //6/27/2021,
            d['dt_updated'] = localDate
        }
        if ('dt_removed' in d) {
            //convert epoch time to string date & remove time part
            var epochDate = new Date(d['dt_removed']*1000);
            var strDate = epochDate.toLocaleString().split(',')[0];
            if (strDate == '12/31/1969') {
                strDate = ''
            }
            d['dt_removed'] = strDate
        }
           
        // if request was to get avm log,
        //  then create 't_created' to show only time for x-axis in bar graph
        if (reqURL == URL_CREATE_MARKET) {
             idx_start = d['dt_updated'].indexOf(',') + 2; // set start after ', '
             d['t_created'] = d['dt_updated'].slice(idx_start, localDate.length)
             var maxValue = Math.max.apply(Math, arr_dics.map(function (item) {
                return item.Value;
            }));
             AMV_LOG_2_MAX_Y = maxValue
        }

    });
    // lstSearchResultsGrid = arr_dics
    // res_len = lstSearchResultsGrid.length
    // create_search_results_grid(res_len)
    //alert('Search Complete; ' +res_len+ ' results')
}

function exe_server_request(reqURL, dictReqKeyVals, cb_response, type) {
    var loadinst = $('[data-remodal-id=loadingModal_post]').remodal();
    //loadinst.open()
    //if (enableLoadingPopups) {loadinst.open();}

    switch(type) {
        case 'GET':
            $.get(reqURL,function(data, status) {
                loadinst.close()
                handle_server_response(data, status, reqURL, cb_response)
            });
            break;
        case 'POST':
            $.post(reqURL,
            {
                // stringify required; de-stringify on server side
                key_vals: JSON.stringify(dictReqKeyVals)
            },function(data, status) {
                loadinst.close()
                handle_server_response(data, status, reqURL, cb_response)
            });
            break;
        default: alert('request type not found: '+type)
    }
}
   
function handle_server_response (data, status, reqURL, cb_response) {
    console.log("request returned");
    if (status.toLowerCase() == "success") {
        var err = data['ERROR']
        var msg = data['MSG']
        console.log("FOUND err == "+err+"; msg == "+msg);
        if (err > 0) {
            if (err == 5) {
                data_mod_id = '[data-remodal-id=errorModal_pin]'
                console.log("SET - var inst = "+data_mod_id+".remodal()");
            } else if (err == 1) {
                data_mod_id = '[data-remodal-id=errorModal_args]'
            } else {
                data_mod_id = '[data-remodal-id=errorModal_server]'
            }
            var inst = $(data_mod_id).remodal();
            inst.open();
        } else {
            console.log("reqURL: '"+reqURL+"' success!")
            console.log(JSON.stringify(data)) // print response
            
            // create dynamic list with return array
            //  ref: https://stackoverflow.com/a/5881473
            var payload = data['PAYLOAD']
            var arr_dics = payload['result_arr']
            cb_response(reqURL, arr_dics)

            //NOTE: not remodal to display for get success
        }
    } else {
        var inst = $('[data-remodal-id=errorModal_network]').remodal();
        inst.open();
    }

    /* comment to disable post request confirmation */
    //if (enableLoadingPopups) {inst.open();}
}

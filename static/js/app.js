function clearAll(){
    /* clear all the input fields */
    jQuery("#service").val('');
    jQuery("#masterpwd").val('');
    /* clear and hide the result panel */
    jQuery("#pwd_service").empty();
    jQuery("#pwd_passphrase").empty();
    jQuery("#pwd_identifier").empty();
    jQuery("#pwd_comment").empty();
    jQuery("#pwd_pwd").empty();
    jQuery("#pwd_pwd").removeClass("alert-success alert-danger");
    jQuery("#pwd_panel").hide();
    /* give focus back to the service input */
    jQuery("#service").focus();
}

function fillPwd(service, pwd, passphrase, id, comment, alert_msg) {
    jQuery("#pwd_service").empty().append("Service: " + service);
    if (passphrase) {
        jQuery("#pwd_passphrase").empty().append(passphrase);
        jQuery("#pwd_passphrase_row").show();
    } else {
        jQuery("#pwd_passphrase").empty();
        jQuery("#pwd_passphrase_row").hide();
    }
    if (id) {
        jQuery("#pwd_identifier").empty().append(id);
        jQuery("#pwd_identifier_row").show();
    } else {
        jQuery("#pwd_identifier").empty();
        jQuery("#pwd_identifier_row").hide();
    }
    if (comment) {
        jQuery("#pwd_comment").empty().append(comment);
        jQuery("#pwd_comment_row").show();
    } else {
        jQuery("#pwd_comment").empty();
        jQuery("#pwd_comment_row").hide();
    }
    if (pwd) {
        jQuery("#pwd_pwd").empty().append(pwd).show();
        jQuery("#pwd_pwd").addClass("alert-success");
    } else if (alert_msg) {
        jQuery("#pwd_pwd").empty().append(alert_msg).show();
        jQuery("#pwd_pwd").addClass("alert-danger");
    } else {
        jQuery("#pwd_pwd").empty().hide();
    }
    jQuery("#pwd_panel").show();
    jQuery("#clear").focus();
}

jQuery(document).ready(function() {

    /* start by clearing out everything */
    clearAll();

    /* click event handler for clear button */
    jQuery("#clear").click(clearAll);

    /* autocomplete service input textbox */
    if (service_list) {
        /* only if there is an existing service list sent from server */
        var list = document.getElementById("service_datalist");
        for (var i = 0; i < service_list.length; i++) {
            var option = document.createElement("option");
            option.value = service_list[i];
            list.appendChild(option);
        }
    }

    /* form submitting */
    jQuery("#form").submit(function(e) {
        e.preventDefault();
        var service_name = $("#service").val();
        var masterpwd = $("#masterpwd").val();
        if (jQuery.inArray(service_name, service_list) >= 0) {
            /* if the required service name belong to the service list known by the
             * server, send a post request */
            jQuery.post("", {"service": service_name})
                .done(function(dict) {
                    if (!dict.val) {
                        /* error: the server couldn't find the service */
                        fillPwd(service_name, null, dict.service_str, null, null, "Error!");
                    } else if (!masterpwd) {
                        /* just display info */
                        fillPwd(service_name, null, dict.service_str, dict.iden, dict.comment);
                        jQuery("#masterpwd").focus();
                    } else {
                        /* compute the password */
                        var input_str = masterpwd + " " + dict.service_str;
                        var pwd = generate(
                                input_str,
                                dict.length,
                                dict.pauth,
                                dict.preq);
                        fillPwd(service_name, pwd, dict.service_str, dict.iden, dict.comment);
                    }
                });
        } else if (masterpwd) {
            /* no need to send out a post request, local computation */
            var input_str = masterpwd + " " + service_name;
            var pwd = generate(input_str);
            fillPwd(service_name, pwd);
        } else {
            /* nothing to be done until the master password is specified */
            jQuery("#masterpwd").focus();
        }
    });
});

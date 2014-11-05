<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>jPass</title>

        <!-- jQuery -->
        <link rel="stylesheet" href="//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">
        <script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"> </script>
        <script src="//code.jquery.com/ui/1.11.2/jquery-ui.js"></script>

        <!-- Bootstrap -->
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css">
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap-theme.min.css">
        <script type="text/javascript" src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>

        <!-- font-awesome -->
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">

        <!-- sha256 -->
        <script type="text/javascript" src="/static/js/sha256.js"></script>
        <!-- lib jPass -->
        <script type="text/javascript" src="/static/js/libjpass.js"></script>

        <!-- the javascript app (jquery) -->
        <script type="text/javascript" src="/static/js/app.js"></script>

        <!-- custom css -->
        <link rel="stylesheet" href="/static/css/style.css">

        <!-- service list -->
        <script type="text/javascript">
var service_list = [
    % if service_list:
    %   for s in service_list:
    "{{s}}",
    %   end
    % end
    ];
        </script>
    </head>

    <body>
        <div id="wrap">
            <div class="container">

                <form id="form" role="form">
                    <h2>jPass</h2>
                    <div class="form-group">
                        <div class="input-group">
                            <span class="input-group-addon"><i class="fa fa-cog fa-fw"></i></span>
                            <input type="text" class="form-control"
                            placeholder="Service name" id="service" required
                            autofocus autocomplete="off">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span>
                            <input type="password" class="form-control"
                            placeholder="Master password" id="masterpwd">
                        </div>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary btn-lg" type="submit"/>Generate</button>
                    </div>
                </form>

                <div class="panel panel-default" id="pwd_panel">
                    <div class="panel-heading">
                        <h3 class="panel-title" id="pwd_service">
                        </h3>
                    </div>
                    <table class="table">
                        % for t in ['passphrase', 'identifier', 'comment']:
                        <tr id="pwd_{{t}}_row">
                            <td>{{t.title()}}</td>
                            <td>:</td>
                            <td id="pwd_{{t}}"></td>
                        </tr>
                        % end
                    </table>
                    <div class="panel-body">
                        <div class="alert" role="alert" id="pwd_pwd"></div>
                        <button class="btn btn-warning" type="button" id="clear">Clear all</button>
                    </div>
                </div>
            </div>
            <div id="push"></div>
        </div>

        <footer>
            <div class="container">
                <p>© 2014 Joël Porquet</p>
            </div>
        </footer>
    </body>
</html>

<!-- vim: set filetype=html: -->

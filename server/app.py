from flask import Flask,url_for
from flask_cors import CORS
from flask import render_template
from flask import request
from flask import jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)


def after_request(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/',methods = ['GET','POST'])
def home():
    return "Welcome!"

@app.route('/get',methods = ['GET','POST'])
def get_data():
   with open('config.json','r') as f:
       file = f.read()
   jsonObj=json.loads(file)
   return jsonify(jsonObj)
    # return 'hello'


@app.route('/set',methods = ['POST'])
def set_data():
    print(request.form['data'])
    with open('config.json','w') as f:
        f.write(request.form['data'])

    log('apply_setting',None)
    return jsonify({'status':True})


# @app.route('/log1',methods = ['POST'])
# def log1():'
#     # a=1&b=2
#     print(request.form['a'])
#     a = request.form['a']
#     return a


@app.route('/log',methods = ['POST'])
def log(strtype,args):
    os.system('osascript -e \'display notification "%s" with title "%s"\'' % ('位置有更新', '号外号外'))
    with open('log/log.txt','a') as f:
        if strtype== 'apply_setting':
            str = datetime.now().strftime('%a, %b %d %H:%M:%S') +'    '+request.remote_addr
            f.write(str+'    apply Setting'+'\n')

if __name__=='__main__':
    app.run(host='0.0.0.0',debug=True)

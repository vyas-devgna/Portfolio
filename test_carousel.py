import threading, http.server, socketserver, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)

def run_server():
    httpd.serve_forever()

server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

time.sleep(2)

options = Options()
options.add_argument('--headless=new')
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)

try:
    driver.get('http://localhost:8000/')
    time.sleep(2)
    
    logs = driver.get_log('browser')
    for log in logs:
        print('CONSOLE:', log)
        
    print('dataset.autoscroll:', driver.execute_script('return document.getElementById("photo-gallery").dataset.autoscroll;'))
    print('children length:', driver.execute_script('return document.getElementById("photo-gallery").children.length;'))
    print('scrollWidth / 3:', driver.execute_script('return document.getElementById("photo-gallery").scrollWidth / 3;'))
    print('isDragging:', driver.execute_script('return window.__isDragging || false;'))
    
except Exception as e:
    print('Error:', e)
finally:
    driver.quit()
    httpd.shutdown()

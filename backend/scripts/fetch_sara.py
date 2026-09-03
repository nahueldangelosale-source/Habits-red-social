import urllib.request
import re

url = 'https://www.argenfood.unlu.edu.ar/Tablas/Varios/Indice.htm'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('latin-1')
    links = re.findall(r'href=[\"\']?([^\s\"\'>]+\.xls)[\"\']?', html, re.I)
    print(f'Found {len(links)} Excel links.')
    for link in links:
        print(link)
except Exception as e:
    print(f'Error: {e}')

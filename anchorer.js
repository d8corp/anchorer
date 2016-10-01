function Anchorer() {
	// ------------ Private -------------
	{
		var _descriptor = [], // Разобранный на обьекты текущий хэш
			_cache = {}, // Кэш для переходов в параллелбные ветки
			_default = [], // Кэш для переходов в текущей ветке
			_loaderIndex = 0, // Индекс актуального загрузчика
			_this = this; // Текущий объкт anchorer
	}

	// --------- Private Methods ---------
	{
		var preloaderIMG = function (images,callback){
			if(!images.length)
				callback();
			else
				images.forEach(function(x,n){
					var img=document.createElement('img');
					img.onload=img.onerror=function(){
						delete images[n];
						images.length--;
						if(!images.length)
							callback();
						delete this;
					};
					img.src=x;
				});
		},
		$attribute = function(element,attribute,value,invert){
			if(element.getAttribute(attribute))
				return element.getAttribute(attribute);
			else
				return invert===undefined?value:(element.hasAttribute(attribute)?invert:value);
		},
		$timeout = function(element){
			return parseInt($attribute(element,_this.attributs.timeout,_this.timeout,0));
		},
		$clearClass = function(element){
			return $attribute(element,_this.attributs.clear,_this.clearClass,0);
		},
		$select = function(element){
			return $attribute(element,_this.attributs.select,_this.selectClass,'');
		},
		$loadBox = function(element){
			return $attribute(element,_this.attributs.load,_this.loadBox,'');
		},
		$default = function(element){
			var $return=$attribute(element,_this.attributs.default,_this.default,!_this.default);
			return $return === 'false'?false:$return;
		},
		$cache = function(element){
			var $return=$attribute(element,_this.attributs.cache,_this.cache,!_this.cache);
			return $return === 'false'?false:$return;
		},
		$selected = function(select,unselected,anchor){
			var name, i = 0, sel;
			if(select){
				select=document.querySelectorAll('a[href="'+select+'"]');
				if(select.length)while(sel=select[i]){
					name=$select(sel);
					if(name)
						sel.classList.add(name);
					if(anchor && sel.hasAttribute(_this.attributs.cache)){
						if(sel.getAttribute(_this.attributs.cache))
							sel.setAttribute('href',sel.getAttribute(_this.attributs.cache));
						sel.setAttribute(_this.attributs.cache,'');
					}
					i++;
				}
			}
			i=0;
			if(unselected){
				unselected=document.querySelectorAll('a[href="'+unselected+'"]');
				if(unselected.length)while(sel=unselected[i]){
					name=$select(sel);
					if(name)
						sel.classList.remove(name);
					if(anchor && sel.hasAttribute(_this.attributs.cache)){
						sel.setAttribute(_this.attributs.cache,sel.getAttribute('href'));
						sel.setAttribute('href',anchor);
					}
					i++;
				}
			}
		},
		$set = function(index,value,element,timeout,clearClass,callback){
			if(index !== _loaderIndex)return false;
			value=value.split('¦');
			if(value[1])
				return preloaderIMG(JSON.parse(value[1]),$set.bind(this,index,value[0],element,timeout,clearClass,callback));
			else
				value=value[0];
			$destroy(element);
			if(timeout && clearClass){
				element.classList.add(clearClass);
			}
			setTimeout(function(){
				if(index !== _loaderIndex)return false;
				_this.set.call(element,value);
				if(timeout && clearClass){
					element.classList.remove(clearClass);
				}
				if(callback)callback();
			},timeout);
		},
		$get = function(index,load,element,timeout,clearClass,loadBox,callback){
			var time=new Date().getTime(),
				timeoutLoad=timeout;
			if(loadBox){
				if($load(index,element,timeout,clearClass,loadBox))
					timeoutLoad=timeout*2+50;
			}
			_this.get(load.send,_this.path+load.path+'.'+_this.extension,function(value){
				setTimeout($set.bind(null,index,value,element,timeout,clearClass,callback),time+timeoutLoad-new Date().getTime());
			});
		},
		$load = function(index,element,timeout,clearClass,loadBox){
			var content=element.innerHTML;
			$destroy(element);
			if(timeout && clearClass && content){
				element.classList.add(clearClass);
			}
			setTimeout(function(){
				if(index !== _loaderIndex)return false;
				element.innerHTML=loadBox;
				if(timeout && clearClass && content){
					element.classList.remove(clearClass);
				}
			},timeout);
			return content;
		},
		$destroy = function(element){
			var scripts = element.querySelectorAll('script');
			[].forEach.call(scripts,function(script){
				if(script.destroy)
					script.destroy.call(script);
			});
		};

		/* 	--------------------- Обработчик хэш ----------------------------
		 *	Создает дескриптор хэш
		 * 	Создает параметры и передает загрузчику содержимого
		 *	Загрузка содержимого по умолчанию при подъеме по дереву
		 *	Очистка кэша для предыдущей страницы при подъеме по дереву
		 *	Очистка выделенного пункта меню при подъеме по дереву
		 *	-----------------------------------------------------------------*/
		var $change = function () {
			// Переменные
			{
				var hash = decodeURIComponent(location.hash), // Текущий хэш
					descriptor = [], // Дескриптор текущего хэш
					section, // Часть дескриптора хэш
					path = '', // Путь к скрипту для части дескриптора хэш
					send = '', // Параметры передаваемые в скрипт для части дескриптора хэш
					cache = _cache, // Текущее дерево кэш
					backCache, // Предыдущее дерево кэш
					manualDescriptor,// Обнаружен переход в соседнюю ветку, последний общий для веток дескриптор
					anchor = '',// Хэш для текущей части
					timeout,
					clearClass,
					element,
					loads = []; // Параметры передаваемые загрузчику
			}
			// Если хэш отсутствует устанавливаем хэш по умолчанию
			if (!hash) {
				return location.hash = _this.start;
			}
			// Разбираем хэш на части
			for (var id = 0; section = _this.hashRegexp.exec(hash); id++) {
				if (_this.router[section[1]]) {
					section[1] = _this.router[section[1]];
				} // Подмена имени части хэш
				path += '/' + section[1]; // Получаем путь к скрипту части хэш
				{
					if (send)
						send += '&';
					if (section[2])
						send += section[1] + '=' + section[2] + '&';
					if (section[3])
						send += section[3] + '&';
					if (send)
						send = send.slice(0, -1);
				} // Получаем параметры части хэш передоваемые в скрипт
				anchor += section[0]; // Получаем хэш части
				descriptor[id] = {
					name: _this.pref + section[1],
					path: path,
					send: send,
					anchor: anchor
				}; // Собираем дескриптор

				// Обнаружен переход в соседнюю ветку
				if (_descriptor[id] && !manualDescriptor && _descriptor[id].anchor !== anchor) {
					manualDescriptor = descriptor[id - 1] || {name: _this.id, anchor: _this.id};
					var container = document.getElementById(manualDescriptor.name),
						cacheDown = cache;
					var links=document.querySelectorAll('a['+_this.attributs.cache+'="'+descriptor[id].anchor+'"]');
					[].forEach.call(links,function(link){
						if(link.getAttribute('href') !== hash){
							link.setAttribute('href',descriptor[id].anchor);
							link.setAttribute(_this.attributs.cache,'');
						}
					});
					$selected(hash,_descriptor[id].anchor,_descriptor[_descriptor.length-1].anchor);
					if($cache(container)){
						for (var index = id; index < _descriptor.length; index++) {
							if (!cacheDown[_descriptor[index].anchor])
								cacheDown[_descriptor[index].anchor] = {};
							cacheDown = cacheDown[_descriptor[index].anchor];
						}
						cacheDown[manualDescriptor.anchor] = {
							name: manualDescriptor.name,
							value: container.innerHTML
						};
					}

				}

				if (!cache[anchor]) {
					cache[anchor] = {};
				} // Создаем объект для кэш
				backCache=cache;
				cache = cache[anchor]; // Переключаемся на следующий кэш

				// Добавляем параметры для загрузчика
				if (!_descriptor[id] || _descriptor[id].anchor != descriptor[id].anchor) {
					if (!id)
						loads.push({name: _this.id});
					else if (!loads.length)
						loads.push(descriptor[id - 1]);
					loads.push(descriptor[id]);
				}
			}

			if (manualDescriptor && cache[manualDescriptor.anchor]) {
				element=document.getElementById(cache[manualDescriptor.anchor].name);
				timeout=$timeout(element);
				clearClass=$clearClass(element);
				_loaderIndex=0;
				$set(0,cache[manualDescriptor.anchor].value,element,timeout,clearClass);
				delete cache[manualDescriptor.anchor];
			}
			else if (_descriptor.length != id && !loads.length) {
				element = document.getElementById(descriptor[id - 1].name);
				delete _cache[_descriptor[id].anchor];
				$selected(null, _descriptor[id].anchor);
				timeout = $timeout(element);
				clearClass = $clearClass(element);
				_loaderIndex=0;
				if($default(element))
					$set(0,_default[_descriptor[id-1].anchor],element,timeout,clearClass);
			}
			else{
				delete backCache[anchor];
				_loaderIndex++;
				$loader(loads, _loaderIndex);
			}
			_descriptor = descriptor;
		};

		/* 	------------------- Загрузчик содержимого -----------------------
		 *	Сохранение содержимого по умолчанию
		 *	Выделение выбранного пункта меню и очистка предыдущего
		 *
		 *	-----------------------------------------------------------------*/
		var $loader = function (loads, loaderIndex) {
			if (_loaderIndex != loaderIndex)return false;
			if (loads.length < 2)return _loaderIndex = 0;
			// Переменные
			{
				var element = document.getElementById((loads.splice(0, 1))[0].name),
					load = loads[0],
					timeout = $timeout(element),
					clearClass = $clearClass(element),
					loadBox = $loadBox(element);
			}
			$selected(load.anchor);
			$get(loaderIndex,load,element,timeout,clearClass,loadBox,function(){
				if (_default[load.anchor] === undefined){
					var box=document.getElementById(load.name);
					if (box && $default(box))
						_default[load.anchor] = document.getElementById(load.name).innerHTML;
				}
				$loader(loads,loaderIndex);
			});
		};


	}

	// ------------- Public --------------
	{
		this.hashRegexp = new RegExp("[#/]([^=&/]+)[=]*([^&/]*)[&]*([^/]*)", "ig"); // Регулярное выражение обработки хэш
		this.path = location.pathname + 'control'; // Путь до сервера
		this.id = 'anchorer'; // id стартового бокса
		this.selectClass = 'select'; // Класс выбранного пкнкта меню
		this.clearClass = 'timeout'; // Класс бокса при очистки содержимого
		this.timeout = 300; // Таймаут при очистке и добавлении элемента, для анимации
		this.default = true; // Кэшировать страници для перемещения по ветке вверх
		this.cache = false; // Кэшировать содержимое бокса
		this.pref = 'a-'; // Префикс для id боксов
		this.router = []; // Подмена имен боксов
		this.loadBox = '<span class="load show">загрузка</span>'; // Содержимое бокса при загрузке
		this.start = '#home'; // Стартовая страница
		this.extension='php';
		this.attributs = {
			select: 'a-select',
			load: 'a-load',
			timeout: 'a-timeout',
			clear: 'a-clear',
			cache: 'a-cache',
			default: 'a-default'
		};
	}

	// ---------- Public Methods ---------
	{
		/* 	---------------------- AJAX загрузчик ---------------------------
		 *	send - параметры передаваемые серверу
		 *	callback - функция вызываемая при ответе сервера
		 *	path - путь до серверного скрипта
		 *	error - функция вызываемая при ошибке соединения
		 *	method - POST или GET запрос
		 *	-----------------------------------------------------------------*/
		this.ajax = function (send, callback, path, error, method) {
			var x = new XMLHttpRequest();
			x.open(method || 'POST', path || location.pathname, true);
			x.onreadystatechange = function () {
				if (this.readyState == 4 && callback)
					callback.call(this, this.responseText);
			};
			if (!method || method === 'POST')
				x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			x.onerror = error;
			x.send(send);
		};

		/* 	------------------- Загрузчик содержимого -----------------------
		 *	Вызывается когда нужно загрузить содержимое
		 *	-----------------------------------------------------------------*/
		this.get=function(send,path,callback){
			_this.ajax(send,callback,path);
		};

		/* 	------------------- Установщик содержимого -----------------------
		 *	Вызывается когда нужно перерисовать содержимое
		 *	-----------------------------------------------------------------*/
		this.set=function(value){
			var tmp=document.createElement('template');
			tmp.innerHTML=value;
			this.innerHTML='';
			this.appendChild(document.importNode(tmp.content,true));
		};

		this.script=function(callback){
			callback.call(document.currentScript);
		};
	}

	// ----------- Create Action ---------
	{
		window.addEventListener("hashchange",$change);
		if(document.readyState=='loading')
			document.addEventListener("DOMContentLoaded",$change);
		else
			$change();
	}
}

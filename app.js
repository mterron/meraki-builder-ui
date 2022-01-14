'use strict';
let switchConfig;
let switchStatus;
let currentPort;

async function getConfig() {
	await fetch('config.json') /* Should be config.cgi */
	.then(response => response.json())
	.then(data => { switchConfig = data });
	switchConfig.ports.forEach(function(port) {
		if (!port.enabled) {
			document.switch.contentDocument.getElementById(port.port_number).setAttribute('fill', '#ccc');
			/* document.switch.contentDocument.getElementById(port.port_number).setAttribute('fill', 'url(#diagonalHatch)'); */
		}
	});
	// document.getElementById('json').innerText = JSON.stringify(switchConfig, null, '\t');
}

async function getSwitchStatus() {
	await fetch('status.json')
	.then(response => response.json())
	.then(data => { switchStatus = data });
	switchStatus.ports.forEach(function(port) { if (port.link.established) {setLinkUp(port.port)}});
	switchStatus.ports.forEach(function(port) { if (port.poe && port.poe.enabled) {setPOEon(port.port)}});
	/* document.getElementById('temptext').innerText = switchStatus.temperature; */
}

function portClick(port) {
	var offset = port - 1;
	document.getElementById('conf_enable').disabled = false;
	document.getElementById('conf_port_id').innerText = port;
	document.getElementById('port_enabled').checked = switchConfig.ports[offset].enabled || false;
	// VLANS
	document.getElementById('vlan_config').disabled = !switchConfig.ports[offset].enabled || false;
	document.getElementById('pvid').value = switchConfig.ports[offset].pvid || '';
	document.getElementById('tagged').checked = switchConfig.ports[offset].tagged || false;
	document.getElementById('vlans').value = switchConfig.ports[offset].vlans || '';
	// POE
	document.getElementById('poe_config').disabled = !switchConfig.ports[offset].enabled || false;
	document.getElementById('poe_mode').value = (switchConfig.ports[offset].poe && switchConfig.ports[offset].poe.mode) ? switchConfig.ports[offset].poe.mode : 'POE_OFF';
	document.getElementById('poe_power').value = (switchStatus.ports[offset].poe && switchStatus.ports[offset].poe.power) ? switchStatus.ports[offset].poe.power : '0';
	document.getElementById('poe_advpower').value = (switchStatus.ports[offset].poe && switchStatus.ports[offset].poe.power) ? switchStatus.ports[offset].poe.advpower :'0';
	// Misc
	document.getElementById('misc_config').disabled = !switchConfig.ports[offset].enabled || false;
	document.getElementById('isolation').checked = switchConfig.ports[offset].isolation || false;
	// document.getElementById('lacp').checked = switchConfig.ports[offset].lacp || false;
	document.getElementById('stp').checked = switchConfig.ports[offset].stp || false;

	for (var i = 1; Object.keys(switchConfig.ports).length; i++) {
		var currentPort = i;
		if (currentPort == port) {
			document.switch.contentDocument.getElementById(port).setAttribute('stroke', '#3b82f6');
			if (document.switch.contentDocument.getElementById('LED_'+port)) {
				document.switch.contentDocument.getElementById('LED_'+port).setAttribute('stroke', '#3b82f6');
			}
		}
		else {
			document.switch.contentDocument.getElementById(currentPort).setAttribute('stroke', '#17202a');
			if (document.switch.contentDocument.getElementById('LED_'+currentPort)) {
				document.switch.contentDocument.getElementById('LED_'+currentPort).setAttribute('stroke', '#17202a');
			}
		}
	}
}

function ledClick() {
/* Blinking amber LED */
// document.switch.contentDocument.getElementById(POWER_LED)
// <animate attributeName="fill" values="#ffb000;#ffbb00;#df9a00;#9f6e00;#333;#9f6e00;#df9a00;#ffbb00;#ffbb00" begin="1s" dur="1.5s" repeatCount="indefinite" />
}

function enablePort() {
	document.getElementById('vlan_config').disabled = !document.getElementById('vlan_config').disabled;
	document.getElementById('poe_config').disabled = !document.getElementById('poe_config').disabled;
	document.getElementById('misc_config').disabled = !document.getElementById('misc_config').disabled;
}

function setLinkUp(port) {
	document.switch.contentDocument.getElementById(port).setAttribute('fill', '#4fba6f');
	if (port > 8) { document.switch.contentDocument.getElementById('LED_' + port).setAttribute('fill', '#4fba6f');}
}

function setLinkDown(port) {
	document.switch.contentDocument.getElementById(port).setAttribute('fill', '#17202a');
	if (port > 8) { 
		document.switch.contentDocument.getElementById('LED_' + port).setAttribute('fill', '#17202a');
	}
}

function setPOEon(port) {
	console.info('POE is ON');
	document.switch.contentDocument.getElementById('POE_' + port).setAttribute('opacity', '1');
}

async function postData(url = '', data = {}) {
	const response = await fetch(url, {method: 'POST', body: JSON.stringify(data)});
	return response.json(); /* parses JSON response into native JavaScript objects */
}

function saveConfig() {
	/* postData('/saveconfig.cgi', switchConfig); */
	console.info('Configuration saved');
}

function applyConfig() {
	/* response = postData('/applyconfig.cgi', ''); */
	console.info('Configuration applied');
}

function isNumber(n){
	return Number(n) == n;
}

function configClick(id) {
	/* do domething */
}

function liveConfig() {
	const evtSource = new EventSource("/cgi-bin/get_config.cgi", { withCredentials: true })
	evtSource.addEventListener("status", function(event) { console.log("Switch status: ", event) });
	evtSource.onerror = function(err) {	console.error("EventSource failed: ", err) };
	// evtSource.onmessage = function(event) { console.log("status", event) };
}
// Rentala Dashboard - REAL API VERSION
235	console.log('🚀 Rentala Dashboard v2.1 - SECURE API INTEGRATION');
236	
237	const API_BASE = 'http://localhost:3002/api';
238	let properties = [];
239	
240	document.addEventListener('DOMContentLoaded', () => {
241	    if (window.auth && window.auth.isAuthenticated()) {
242	        initDashboard();
243	    }
244	});
245	
246	async function initDashboard() {
247	    updateUserInfo();
248	    await loadMetrics();
249	    await loadProperties();
250	    setupEventListeners();
251	}
252	
253	function updateUserInfo() {
254	    const user = window.auth.getUser();
255	    const userDisplay = document.getElementById('userDisplay');
256	    if (userDisplay && user) {
257	        userDisplay.textContent = `${user.firstName} ${user.lastName}`;
258	    }
259	}
260	
261	async function loadMetrics() {
262	    try {
263	        const response = await fetch(`${API_BASE}/metrics/overview`, {
264	            headers: { 'Authorization': `Bearer ${window.auth.getToken()}` }
265	        });
266	        if (response.ok) {
267	            const metrics = await response.json();
268	            updateMetricsUI(metrics);
269	        }
270	    } catch (error) {
271	        console.error('Error loading metrics:', error);
272	    }
273	}
274	
275	function updateMetricsUI(metrics) {
276	    const elements = {
277	        totalProperties: document.getElementById('totalProperties'),
278	        totalUnits: document.getElementById('totalUnits'),
279	        occupancyRate: document.getElementById('occupancyRate'),
280	        monthlyRevenue: document.getElementById('monthlyRevenue')
281	    };
282	
283	    if (elements.totalProperties) elements.totalProperties.textContent = metrics.totalProperties;
284	    if (elements.totalUnits) elements.totalUnits.textContent = metrics.totalUnits;
285	    if (elements.occupancyRate) elements.occupancyRate.textContent = `${metrics.occupancyRate}%`;
286	    if (elements.monthlyRevenue) elements.monthlyRevenue.textContent = `R ${metrics.monthlyRevenue.toLocaleString()}`;
287	}
288	
289	async function loadProperties() {
290	    try {
291	        const response = await fetch(`${API_BASE}/properties`, {
292	            headers: { 'Authorization': `Bearer ${window.auth.getToken()}` }
293	        });
294	        if (response.ok) {
295	            properties = await response.json();
296	            renderProperties();
297	        }
298	    } catch (error) {
299	        console.error('Error loading properties:', error);
300	    }
301	}
302	
303	function renderProperties() {
304	    const container = document.getElementById('propertyGrid');
305	    if (!container) return;
306	
307	    if (properties.length === 0) {
308	        container.innerHTML = '<div class="empty-state">No properties found. Add your first property!</div>';
309	        return;
310	    }
311	
312	    container.innerHTML = properties.map(p => `
313	        <div class="property-card glass">
314	            <div class="property-image">
315	                <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&q=80" alt="Property">
316	                <span class="status-badge ${p.status}">${p.status}</span>
317	            </div>
318	            <div class="property-info">
319	                <h3>${p.address}</h3>
320	                <p class="location">${p.city}, ${p.state}</p>
321	                <div class="property-stats">
322	                    <span><i class="fas fa-building"></i> ${p.totalUnits} Units</span>
323	                    <span><i class="fas fa-tag"></i> ${p.type}</span>
324	                </div>
325	                <div class="property-footer">
326	                    <span class="price">R ${p.currentValue.toLocaleString()}</span>
327	                    <button class="btn-secondary" onclick="viewProperty(${p.id})">View Details</button>
328	                </div>
329	            </div>
330	        </div>
331	    `).join('');
332	}
333	
334	function setupEventListeners() {
335	    const addBtn = document.getElementById('addPropertyBtn');
336	    const modal = document.getElementById('propertyModal');
337	    const closeBtn = document.querySelector('.close-modal');
338	    const form = document.getElementById('propertyForm');
339	
340	    if (addBtn) addBtn.onclick = () => modal.style.display = 'block';
341	    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
342	    
343	    window.onclick = (event) => {
344	        if (event.target == modal) modal.style.display = 'none';
345	    };
346	
347	    if (form) {
348	        form.onsubmit = async (e) => {
349	            e.preventDefault();
350	            const formData = new FormData(form);
351	            const data = Object.fromEntries(formData.entries());
352	            
353	            try {
354	                const response = await fetch(`${API_BASE}/properties`, {
355	                    method: 'POST',
356	                    headers: {
357	                        'Content-Type': 'application/json',
358	                        'Authorization': `Bearer ${window.auth.getToken()}`
359	                    },
360	                    body: JSON.stringify(data)
361	                });
362	
363	                if (response.ok) {
364	                    modal.style.display = 'none';
365	                    form.reset();
366	                    await initDashboard();
367	                }
368	            } catch (error) {
369	                console.error('Error adding property:', error);
370	            }
371	        };
372	    }
373	}
374	
375	window.logout = () => window.auth.logout();
376	window.viewProperty = (id) => console.log('Viewing property:', id);
377	

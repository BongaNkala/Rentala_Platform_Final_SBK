// Rentala Authentication Manager - REAL API VERSION
135	class AuthManager {
136	    constructor() {
137	        this.currentUser = null;
138	        this.token = null;
139	        this.API_BASE = 'http://localhost:3002/api/auth';
140	        this.init();
141	    }
142	
143	    init() {
144	        const savedUser = localStorage.getItem('rentala_user');
145	        const savedToken = localStorage.getItem('rentala_token');
146	        
147	        if (savedUser && savedToken) {
148	            this.currentUser = JSON.parse(savedUser);
149	            this.token = savedToken;
150	            console.log('✅ User restored from storage:', this.currentUser.email);
151	        }
152	    }
153	
154	    async login(email, password) {
155	        try {
156	            const response = await fetch(`${this.API_BASE}/login`, {
157	                method: 'POST',
158	                headers: { 'Content-Type': 'application/json' },
159	                body: JSON.stringify({ email, password })
160	            });
161	
162	            const data = await response.json();
163	
164	            if (response.ok) {
165	                this.currentUser = data.user;
166	                this.token = data.token;
167	                
168	                localStorage.setItem('rentala_user', JSON.stringify(this.currentUser));
169	                localStorage.setItem('rentala_token', this.token);
170	                
171	                console.log('✅ Login successful');
172	                return { success: true, user: this.currentUser };
173	            } else {
174	                console.error('❌ Login failed:', data.error);
175	                return { success: false, message: data.error || 'Invalid credentials' };
176	            }
177	        } catch (error) {
178	            console.error('❌ Network error during login:', error);
179	            return { success: false, message: 'Server connection error' };
180	        }
181	    }
182	
183	    async register(userData) {
184	        try {
185	            const response = await fetch(`${this.API_BASE}/register`, {
186	                method: 'POST',
187	                headers: { 'Content-Type': 'application/json' },
188	                body: JSON.stringify(userData)
189	            });
190	
191	            const data = await response.json();
192	
193	            if (response.ok) {
194	                this.currentUser = data.user;
195	                this.token = data.token;
196	                
197	                localStorage.setItem('rentala_user', JSON.stringify(this.currentUser));
198	                localStorage.setItem('rentala_token', this.token);
199	                
200	                return { success: true, user: this.currentUser };
201	            } else {
202	                return { success: false, message: data.error || 'Registration failed' };
203	            }
204	        } catch (error) {
205	            return { success: false, message: 'Server connection error' };
206	        }
207	    }
208	
209	    logout() {
210	        this.currentUser = null;
211	        this.token = null;
212	        localStorage.removeItem('rentala_user');
213	        localStorage.removeItem('rentala_token');
214	        console.log('✅ User logged out');
215	        window.location.href = 'login.html';
216	    }
217	
218	    isAuthenticated() {
219	        return this.currentUser !== null && this.token !== null;
220	    }
221	
222	    getUser() { return this.currentUser; }
223	    getToken() { return this.token; }
224	}
225	
226	window.auth = new AuthManager();
227	
228	// Auto-protect dashboard
229	if (window.location.pathname.includes('dashboard.html')) {
230	    if (!window.auth.isAuthenticated()) {
231	        window.location.href = 'login.html';
232	    }
233	}
234	

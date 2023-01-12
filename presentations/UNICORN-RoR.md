---
title: Unicorn and RoR
---

# Unicorn w/ RoR
_Internals, Web Hosting and Scaling_

---

# Unix Sockets

---

<!-- .slide: data-transition="convex-in none-out" -->
<img data-src="assets/Unicorn-RoR-Socket0.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-RoR-Socket1.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-RoR-Socket2.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-RoR-Socket3.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in convex-out" -->
<img data-src="assets/Unicorn-RoR-Socket4.svg" class="stretch"/>

---

# fork()

Inherited resources:

* **handles** - file, socket, ...
* **code segments**
* **data segments** - copy-on-write 

---

# Unix Signals

* **INT / TERM** - <font size="6">quick shutdown, kills all workers</font>
* **QUIT** - <font size="6">graceful shutdown</font>
* **USR1** - <font size="6">reopen all logs (log rotation)</font>
* **USR2** - <font size="6">reexecute the running binary</font>
* **TTIN / TTOU** - <font size="6">increase/decrease the number of wokers</font>
* **HUP** - <font size="6">reload the configuraion file</font>
* **WINCH** -  <font size="6">keep master running, gracefully stop workers</font>

---

# Unicorn in Action

---

<!-- .slide: data-transition="convex-in none-out" -->
<img data-src="assets/Unicorn-Page-1.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-2.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-3.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-4.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-5.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-6.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-7.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-8.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-9.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-10.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in none-out" -->
<img data-src="assets/Unicorn-Page-11.svg" class="stretch"/>

---

<!-- .slide: data-transition="fade-in convex-out" -->
<img data-src="assets/Unicorn-Page-12.svg" class="stretch"/>

---

# Local scaling strategies

CPU Topologies

* **SMP** - <font size="6">Symmetric multiprocessing</font>
* **NUMA** - <font size="6">Non-uniform memory access</font>
* **SMT** - <font size="6">Simultaneous multi-threading</font>
* **IMT** - <font size="6">Interleaved multi-threading</font>
* *...*

|                     |    Pro           |       Con           | 
|---------------------|:----------------:|:-------------------:|
| **Multiprocessing** | Isolation        | Context switch      |
| **Multithreading**  | Memory footprint | Unhandled exception |

---

# Being locked up in container

* Resource limitations
  * OOM killer
  * freezer cgroup
* Limited hardware topology awarness
  * bind mount devices
  * privileged mode
* Image delivery (large images)
  * local- or proxy registry

---

# HTTP/1.1 - keep-alive

<img data-src="assets/HTTP_persistent_connection.svg" class="stretch"/>

---

# HTTP/1.1 - pipelining

<img data-src="assets/HTTP_pipelining2.svg" class="stretch"/>

---

# Orchestration in (AWS) Cloud

<img data-src="assets/Unicorn-RoR-Orchestration.svg" class="stretch"/>

---

# DEMO Time
_Docker_

---

# Scenario #1

<img data-src="assets/Unicorn-RoR-Benchmark1.svg" class="stretch"/>

---

# Scenario #2

<img data-src="assets/Unicorn-RoR-Benchmark2.svg" class="stretch"/>

---

# 👍 _Thank You_ 👍

<font size="6">**presentation:** [https://revealjs.com/markdown/](https://revealjs.com/markdown/)</font>

<font size="6">**drawings:** [https://drawio-app.com/](https://drawio-app.com/)</font>

<font size="6">**benchmarker:** [https://locust.io/](https://locust.io/)</font>

<font size="6">**e-mail:** <psaghelyi@diligent.com></font>

/**
 * Interactividad para la Vista de Mesas Tipo Mapa
 * Mejora la experiencia de usuario con animaciones y efectos dinámicos
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // ANIMACIÓN DE ENTRADA DE TARJETAS
    // ========================================
    const mesaCards = document.querySelectorAll('.mesa-card');

    // Animar entrada escalonada de tarjetas
    mesaCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // ========================================
    // CONFIRMACIÓN DE ELIMINACIÓN MEJORADA
    // ========================================
    const deleteButtons = document.querySelectorAll('.btn-delete');

    deleteButtons.forEach(button => {
        button.closest('form').addEventListener('submit', function (e) {
            e.preventDefault();

            const mesaCard = button.closest('.mesa-card');
            const mesaNombre = mesaCard.querySelector('.mesa-number').textContent;

            // Modal de confirmación personalizado (simple)
            const confirmar = confirm(
                `⚠️ ¿Estás seguro de eliminar "${mesaNombre}"?\n\n` +
                `Esta acción no se puede deshacer.\n` +
                `Solo se puede eliminar si no tiene reservas futuras.`
            );

            if (confirmar) {
                // Animación de salida antes de eliminar
                mesaCard.style.transition = 'all 0.4s ease';
                mesaCard.style.opacity = '0';
                mesaCard.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    this.submit();
                }, 400);
            }
        });
    });

    // ========================================
    // EFECTO DE PARALLAX SUAVE EN HOVER
    // ========================================
    mesaCards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const icon = card.querySelector('.mesa-icon');
            if (icon) {
                icon.style.transform = `translate(${deltaX * 5}px, ${deltaY * 5}px) scale(1.05)`;
            }
        });

        card.addEventListener('mouseleave', function () {
            const icon = card.querySelector('.mesa-icon');
            if (icon) {
                icon.style.transform = 'translate(0, 0) scale(1)';
            }
        });
    });

    // ========================================
    // INDICADOR DE CARGA EN PAGINACIÓN
    // ========================================
    const paginationButtons = document.querySelectorAll('.pagination-btn');

    paginationButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Mostrar indicador de carga
            button.style.opacity = '0.6';
            button.style.pointerEvents = 'none';

            // Crear spinner
            const spinner = document.createElement('span');
            spinner.innerHTML = '⟳';
            spinner.style.display = 'inline-block';
            spinner.style.animation = 'spin 1s linear infinite';

            const textSpan = button.querySelector('span');
            if (textSpan) {
                const originalText = textSpan.textContent;
                button.dataset.originalText = originalText;
                textSpan.textContent = 'Cargando...';
            }
        });
    });

    // Agregar animación de spin si no existe
    if (!document.querySelector('#mesa-animations')) {
        const style = document.createElement('style');
        style.id = 'mesa-animations';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // TOOLTIPS INFORMATIVOS
    // ========================================
    const infoItems = document.querySelectorAll('.info-item');

    infoItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.02)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });

    // ========================================
    // FILTRO VISUAL POR ZONA (OPCIONAL)
    // ========================================
    function createZoneFilter() {
        const header = document.querySelector('.mesas-header');
        if (!header || document.querySelector('.zone-filter')) return;

        const zones = ['interior', 'terraza', 'barra', 'privado', 'general'];
        const zoneColors = {
            'interior': '#3498db',
            'terraza': '#27ae60',
            'barra': '#e74c3c',
            'privado': '#9b59b6',
            'general': '#C7A86C'
        };

        const filterContainer = document.createElement('div');
        filterContainer.className = 'zone-filter';
        filterContainer.style.cssText = `
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        `;

        // Botón "Todas"
        const allButton = createFilterButton('Todas', 'all', '#6E1825');
        allButton.classList.add('active');
        filterContainer.appendChild(allButton);

        // Botones de zona
        zones.forEach(zone => {
            const button = createFilterButton(
                zone.charAt(0).toUpperCase() + zone.slice(1),
                zone,
                zoneColors[zone]
            );
            filterContainer.appendChild(button);
        });

        header.appendChild(filterContainer);

        // Event listeners para filtrado
        filterContainer.addEventListener('click', function (e) {
            const button = e.target.closest('.filter-btn');
            if (!button) return;

            // Remover active de todos
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Activar el clickeado
            button.classList.add('active');

            const filterZone = button.dataset.zone;

            // Filtrar tarjetas
            mesaCards.forEach(card => {
                if (filterZone === 'all' || card.classList.contains(`zona-${filterZone}`)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    }

    function createFilterButton(text, zone, color) {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = text;
        button.dataset.zone = zone;
        button.style.cssText = `
            padding: 0.5rem 1rem;
            border: 2px solid ${color};
            background: white;
            color: ${color};
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
        `;

        button.addEventListener('mouseenter', function () {
            this.style.background = color;
            this.style.color = 'white';
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function () {
            if (!this.classList.contains('active')) {
                this.style.background = 'white';
                this.style.color = color;
                this.style.transform = 'translateY(0)';
            }
        });

        // Estilo para botón activo
        const style = document.createElement('style');
        style.textContent = `
            .filter-btn.active {
                background: ${color} !important;
                color: white !important;
            }
        `;
        document.head.appendChild(style);

        return button;
    }

    // Activar filtro solo si hay mesas (comentar si no se desea)
    // createZoneFilter();

    // ========================================
    // CONTADOR DE ANIMACIÓN PARA ESTADÍSTICAS
    // ========================================
    const statValues = document.querySelectorAll('.stat-value');

    statValues.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        if (isNaN(finalValue)) return;

        let currentValue = 0;
        const increment = Math.ceil(finalValue / 30);
        const duration = 1000;
        const stepTime = duration / (finalValue / increment);

        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                stat.textContent = finalValue;
                clearInterval(counter);
            } else {
                stat.textContent = currentValue;
            }
        }, stepTime);
    });

    // ========================================
    // RIPPLE EFFECT EN BOTONES
    // ========================================
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            top: ${y}px;
            left: ${x}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    document.querySelectorAll('.action-btn, .btn-primary, .pagination-btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    console.log('✅ Sistema de Gestión de Mesas cargado correctamente');
});

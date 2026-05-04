import 'package:flutter/material.dart';

class PresencaScreen extends StatelessWidget {
  const PresencaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final Color rosaVibrante = Theme.of(context).primaryColor;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA), // Cinza bem clarinho de fundo
      body: Column(
        children: [
          // Cabeçalho mais moderno e compacto
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(25, 60, 25, 30),
            decoration: BoxDecoration(
              color: rosaVibrante,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(30)),
            ),
            child: const Text(
              "Sua Frequência",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(25.0),
            child: Column(
              children: [
                // Gráfico de progresso circular centralizado
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 150,
                      height: 150,
                      child: CircularProgressIndicator(
                        value: 0.87, // 87% de presença
                        strokeWidth: 12,
                        backgroundColor: Colors.black12,
                        valueColor: AlwaysStoppedAnimation<Color>(rosaVibrante),
                      ),
                    ),
                    Column(
                      children: [
                        Text("87%", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: rosaVibrante)),
                        const Text("Presença", style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
                
                const SizedBox(height: 30),

                // Botão de Confirmar Presença (Estilo Apple/Moderno)
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: rosaVibrante,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text("CONFIRMAR PRESENÇA", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),

          // Lista de Histórico
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 25),
              child: ListView(
                children: [
                  const Text("HISTÓRICO RECENTE", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 15),
                  _itemHistorico("Reunião Ordinária", "03/06", true),
                  _itemHistorico("Assembléia Geral", "27/05", true),
                  _itemHistorico("Reunião de Projetos", "20/05", false), // Falta
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _itemHistorico(String nome, String data, bool presente) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(nome, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(data, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
          Icon(
            presente ? Icons.check_circle : Icons.cancel,
            color: presente ? Colors.green : Colors.redAccent,
          )
        ],
      ),
    );
  }
}
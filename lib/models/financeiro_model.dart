import 'package:cloud_firestore/cloud_firestore.dart';

class FinanceiroModel {
  final String id;
  final String descricao;
  final double valor;
  final String tipo; 
  final String data;
  final DateTime criadoEm;

  FinanceiroModel({
    required this.id,
    required this.descricao,
    required this.valor,
    required this.tipo,
    required this.data,
    required this.criadoEm,
  });

  factory FinanceiroModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    // Converte o Timestamp do Firebase para DateTime com segurança
    Timestamp? timestamp = data['criadoEm'] as Timestamp?;
    DateTime dataCriacao = timestamp != null ? timestamp.toDate() : DateTime.now();

    return FinanceiroModel(
      id: doc.id,
      descricao: data['descricao'] ?? '',
      valor: (data['valor'] ?? 0.0).toDouble(),
      tipo: data['tipo'] ?? 'entrada',
      data: data['data'] ?? '',
      criadoEm: dataCriacao,
    );
  }
}
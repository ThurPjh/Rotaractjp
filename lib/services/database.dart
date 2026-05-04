import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final CollectionReference eventosCollection = FirebaseFirestore.instance
      .collection('eventos');

  Future<void> addEvento(String nome, String descricao, DateTime data) async {
    await eventosCollection.add({
      'nome': nome,
      'descricao': descricao,
      'data': data,
      'criadoEm': FieldValue.serverTimestamp(),
    });
    // Removendo o 'return' antes do 'await', o erro desaparece!
  }
}

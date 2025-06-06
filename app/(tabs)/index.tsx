import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFirestore } from '../../context/storageFirebase';
import { DocumentData } from 'firebase/firestore';
import formatDate from '@/timeParse'
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'expo-router';


interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: string;
  customerId: string;
  deliveryAddress: string;
  itemsSummary: OrderItem[];
  recipientName: string;
  recipientPhone: string;
  shipmentStatus: string;
  totalAmount: number;
}

export default function Index() {
  const { getDocuments, updateDocument } = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const docs = await getDocuments('ship');
      const readyToShipOrders = docs
        .filter(doc => doc.shipmentStatus === 'ready_to_ship')
        .map((doc: DocumentData) => ({
          id: doc.id,
          createdAt: doc.createdAt,
          customerId: doc.customerId,
          deliveryAddress: doc.deliveryAddress,
          itemsSummary: doc.itemsSummary,
          recipientName: doc.recipientName,
          recipientPhone: doc.recipientPhone,
          shipmentStatus: doc.shipmentStatus,
          totalAmount: doc.totalAmount,
        })) as Order[];
      setOrders(readyToShipOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
    else  fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateDocument('ship', orderId, {
        shipmentStatus: 'shipping',
        idShipper: user?.uid
      });
      // Refresh danh sách sau khi cập nhật
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.customerName}>{item.recipientName}</Text>
          <Text style={styles.orderTime}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmount}>{item.totalAmount.toLocaleString()}đ</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.infoText}>{item.deliveryAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={20} color="#2196F3" />
          </View>
          <Text style={styles.infoText}>{item.recipientPhone}</Text>
        </View>

        <View style={styles.itemsList}>
          <View style={styles.iconContainer}>
            <Ionicons name="cart-outline" size={20} color="#FF9800" />
          </View>
          <View style={styles.productsContainer}>
            {item.itemsSummary.map((product, index) => (
              <Text key={index} style={styles.productText}>
                {product.quantity} x {product.productName}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptOrder(item.id)}
      >
        <Ionicons name="bicycle-outline" size={20} color="#fff" />
        <Text style={styles.acceptButtonText}>Nhận đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  orderTime: {
    color: "#666",
    fontSize: 13,
  },
  totalAmountContainer: {
    alignItems: "flex-end",
  },
  totalAmountLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  orderInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsList: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  productsContainer: {
    flex: 1,
    gap: 4,
  },
  infoText: {
    flex: 1,
    color: "#333",
    fontSize: 15,
    lineHeight: 20,
  },
  productText: {
    color: "#333",
    fontSize: 15,
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
